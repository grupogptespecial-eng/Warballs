package com.geronimo.controlelgwifi

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteMacroRunnerTest {
    @Test
    fun executesCommandsInOrder() = runTest {
        val actions = mutableListOf<RemoteAction>()
        val runner = RemoteMacroRunner(object : RemoteMacroRunner.Host {
            override fun isConnected() = true
            override suspend fun waitForConnection() = true
            override suspend fun send(action: RemoteAction): Boolean { actions += action; return true }
            override suspend fun launchApp(appId: String) = true
            override suspend fun switchInput(inputId: String) = true
            override suspend fun insertText(text: String) = true
            override fun onProgress(index: Int, total: Int, message: String) = Unit
        })
        val macro = RemoteMacro(
            "test",
            "Test",
            listOf(
                MacroStep(MacroStepType.Command, RemoteAction.Home),
                MacroStep(MacroStepType.Delay, delayMs = 100),
                MacroStep(MacroStepType.Command, RemoteAction.PlayPause)
            )
        )

        val result = runner.execute(macro)

        assertTrue(result.success)
        assertEquals(listOf(RemoteAction.Home, RemoteAction.PlayPause), actions)
    }

    @Test
    fun stopsOnFailedRequiredStep() = runTest {
        val runner = RemoteMacroRunner(object : RemoteMacroRunner.Host {
            override fun isConnected() = true
            override suspend fun waitForConnection() = true
            override suspend fun send(action: RemoteAction) = false
            override suspend fun launchApp(appId: String) = false
            override suspend fun switchInput(inputId: String) = false
            override suspend fun insertText(text: String) = false
            override fun onProgress(index: Int, total: Int, message: String) = Unit
        })
        val result = runner.execute(
            RemoteMacro("test", "Test", listOf(MacroStep(MacroStepType.Command, RemoteAction.Home)))
        )
        assertFalse(result.success)
        assertEquals(0, result.completedSteps)
    }
}
