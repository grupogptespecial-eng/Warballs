package com.geronimo.controlelgwifi

internal object LgPointerProtocol {
    fun button(name: String): String =
        "type:button\nname:${name.uppercase()}\n\n"

    fun move(dx: Int, dy: Int): String =
        "type:move\ndx:${dx.coerceIn(-240, 240)}\ndy:${dy.coerceIn(-240, 240)}\ndown:0\n\n"

    fun click(): String = "type:click\n\n"

    fun scroll(delta: Int): String =
        "type:scroll\ndx:0\ndy:${delta.coerceIn(-80, 80)}\n\n"
}
