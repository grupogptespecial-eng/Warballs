// Lógica específica da classe Monge

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { inFrontArc, projApproaching } from '../utils/geometry.js';
import { rrand } from '../utils/rand.js';
import { nearestEnemyOf } from './unit.js';

export function monkHP(level) { return CFG.monge.hpBase + CFG.monge.hpPerLevel * (level - 1); }
export function monkBodyDamage(level) { return CFG.monge.baseBodyDamageL1 + Math.floor((level - 1) * CFG.monge.bodyDamagePerLvl); }
export function monkVMinBonus(level) { return Math.min(CFG.monge.vMinBonusCap, CFG.monge.vMinBonusPerLevel * (level - 1)); }
export function monkVMaxBonus(level) { return Math.min(CFG.monge.vMaxBonusCap, CFG.monge.vMaxBonusPerLevel * (level - 1)); }
export function monkConeRad(deg) { return (deg * Math.PI / 180) * 0.5; }
export function monkScaledDamage(base, velLen) {
  const k = CFG.monge.stacks.k, vRef = CFG.monge.stacks.vRef;
  return base + k * (velLen / vRef) * base;
}

export function makeMonkState() {
  return {
    stacks: 0,
    stacksExpire: 0,
    rajadaT: 0,
    rajadaCD: 0,
    deflectT: 0,
    deflectCD: 0,
    localHitT: 0,
    flurryT: 0,
    flurryVictim: null,
    nextHit: 0,
    hitsLeft: 0,
    accSelf: new V(0, 0),
    accVict: new V(0, 0)
  };
}

export function monkOnHitDealt() {
  if (!this.monk) return;
  const m = CFG.monge.stacks;
  this.monk.stacks = Math.min(m.max, (this.monk.stacks || 0) + 1);
  this.monk.stacksExpire = performance.now() / 1000 + m.time;
}

export function monkNaturalAccel(dt){
  if (!this.monk) return;
  const s = this.monk.stacks || 0;
  const a = CFG.monge.accel.base + CFG.monge.accel.perStack * s;
  const fwd = this.vel.len() > 1e-3 ? this.vel.clone().nrm() : V.fromAng(this.angle, 1);
  this.vel.add(fwd.mul(a * dt));
}

export function monkImpactBurst(kind, dir){
  if (!this.monk) return;
  const spd = (kind === 'wall') ? CFG.monge.impactBurst.wallSpeed : CFG.monge.impactBurst.speed;
  const pushDir = dir ? dir.clone().nrm() : (this.vel.len()>1e-3 ? this.vel.clone().nrm() : V.fromAng(this.angle,1));
  this.vel.add(pushDir.mul(spd));
  if (CFG.monge.impactBurst.grantStack) this.monkOnHitDealt();
}

export function monkApplyPassive(dt) {
  if (!this.monk) return;
  const s = this.monk.stacks || 0;
  if (s > 0) {
    const mult = 1 + CFG.monge.stacks.speed * s * dt;
    this.vel.mul(mult);
  }
}

export function monkSeek(dt){
  const t = nearestEnemyOf(this);
  if (!t) return;
  const dir = new V(t.pos.x - this.pos.x, t.pos.y - this.pos.y).nrm();
  this.vel.add(dir.mul(CFG.monge.seek.force * dt));
}

export function monkFlurryTick(dt){
  const m = this.monk;
  if (!m || m.flurryT <= 0) return;
  m.flurryT -= dt;
  m.nextHit -= dt;
  const target = m.flurryVictim;
  if (!target || !target.alive) { this.monkEndFlurry(); return; }
  if (m.nextHit <= 0 && m.hitsLeft > 0) {
    const n = new V(target.pos.x - this.pos.x, target.pos.y - this.pos.y).nrm();
    let dmg = monkBodyDamage(this.level) * CFG.monge.rajada.bonus * CFG.monge.dmgMult;
    const dealt = target.hit(dmg, new V(0,0), this);
    if (dealt > 0) {
      this.monkOnHitDealt();
      m.accVict.add(n.clone().mul(CFG.monge.impulseOnHit));
      m.accSelf.add(n.clone().mul(-CFG.monge.impulseOnHit * 0.8));
      this.gainXPOffense(dealt);
    }
    m.hitsLeft--;
    m.nextHit = CFG.monge.rajada.interval;
  }
  if (m.flurryT <= 0 || m.hitsLeft <= 0) {
    this.monkEndFlurry();
  }
}

export function monkEndFlurry(){
  const m = this.monk; if (!m) return;
  const target = m.flurryVictim;
  if (m.accSelf && (m.accSelf.x||m.accSelf.y)) this.vel.add(m.accSelf.clone().mul(1/this.mass));
  if (target && target.alive && m.accVict && (m.accVict.x||m.accVict.y)) {
    target.vel.add(m.accVict.clone().mul(1/target.mass));
  }
  this.freezeT = 0; if (this.freezeReason === 'flurry') this.freezeReason = null;
  if (target) { target.freezeT = 0; if (target.freezeReason === 'flurry') target.freezeReason = null; }
  m.flurryT = 0; m.hitsLeft = 0; m.nextHit = 0;
  m.accSelf = new V(0,0); m.accVict = new V(0,0); m.flurryVictim = null;
}

export function monkTryRajada(dt) {
  if (!this.monk || this.monk.flurryT > 0 || this.monk.rajadaCD > 0) return;
  const cone = monkConeRad(CFG.monge.rajada.coneDeg);
  let best=null, bestD=1e9;
  for (const v of game.units) {
    if (v===this || !v.alive) continue;
    if (this.team && v.team && this.team===v.team) continue;
    if (!inFrontArc(this, v.pos, cone, CFG.monge.rajada.detectR)) continue;
    const d = new V(v.pos.x - this.pos.x, v.pos.y - this.pos.y).len();
    if (d < bestD) { bestD = d; best = v; }
  }
  if (!best) return;
  const P = CFG.monge.rajada;
  this.monk.flurryT = P.dur;
  this.monk.hitsLeft = P.hits;
  this.monk.nextHit = 0;
  this.monk.accSelf = new V(0,0);
  this.monk.accVict = new V(0,0);
  this.monk.flurryVictim = best;
  this.freezeT = P.dur; this.freezeReason = 'flurry';
  best.freezeT = P.dur; best.freezeReason = 'flurry';
  this.vel.mul(0); best.vel.mul(0);
  this.monk.rajadaCD = P.cd;
}

export function monkTryDeflect(dt) {
  if(!this.monk || this.monk.deflectT>0 || this.monk.deflectCD>0) return;
  const cone = monkConeRad(CFG.monge.deflect.coneDeg);
  for(const p of game.projectiles){
    if(!p.alive) continue;
    if(!p.owner || (this.team && p.owner.team && p.owner.team===this.team)) continue;
    if(!projApproaching(p, this)) continue;
    if(inFrontArc(this, p.pos, cone, CFG.monge.deflect.rSense)){
      this.monk.deflectT = CFG.monge.deflect.dur;
      this.monk.deflectCD = CFG.monge.deflect.cd;
      break;
    }
  }
}

export function monkParryAgainst(other){
  if (this.className !== 'monge' || !this.monk || this.monk.deflectT <= 0) return false;
  if (!other || !other.alive) return false;
  if (this.team && other.team && this.team === other.team) return false;
  if (!other.weaponLen || !other.weaponTipR) return false;
  const tip = other.tip();
  const cone = monkConeRad(CFG.monge.deflect.coneDeg);
  const allow = inFrontArc(this, tip, cone, CFG.monge.deflect.rHit + other.weaponTipR + 6);
  if (!allow) return false;
  const toTip = new V(tip.x - this.pos.x, tip.y - this.pos.y);
  const n = toTip.clone().nrm();
  const t = new V(-n.y, n.x);
  if (other.omega === 0) other.omega = (Math.random() < .5 ? 1 : -1) * 2.6;
  other.omega *= CFG.monge.parry.omegaMul;
  other.vel.add(t.mul(CFG.monge.parry.tangentForce / other.mass));
  other.vel.add(n.mul(CFG.monge.parry.radialPush / other.mass));
  other.weaponLockT = Math.max(other.weaponLockT || 0, CFG.monge.parry.staggerT);
  for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
    game.spawnParticle(new Particle(
      tip.clone(),
      V.fromAng(Math.random() * Math.PI * 2, rrand(30, 120)),
      rrand(.12, .3),
      '#ffe9b3'
    ));
  }
  return true;
}

