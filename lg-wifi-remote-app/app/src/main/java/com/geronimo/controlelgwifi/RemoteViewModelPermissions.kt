package com.geronimo.controlelgwifi

/**
 * Android 17+ can deny broad local-network access. The current Play target is API 35,
 * so this callback is intentionally side-effect free; the connect screen remains closed
 * and the user can retry after enabling the permission in system settings.
 */
fun RemoteViewModel.permissionDenied() = Unit
