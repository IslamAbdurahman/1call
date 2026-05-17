<?php

namespace App\Services\Asterisk;

use Illuminate\Support\Facades\Log;

class AsteriskCliService
{
    /**
     * Run an Asterisk CLI command using sudo.
     * Note: www-data must have sudo access to /usr/sbin/asterisk.
     */
    protected function runCommand(string $command): array
    {
        $output = [];
        $returnVar = -1;
        // The path to asterisk might be /usr/sbin/asterisk
        $cmd = "sudo asterisk -rx \"{$command}\" 2>&1";
        exec($cmd, $output, $returnVar);

        return [
            'success' => $returnVar === 0,
            'output' => $output,
        ];
    }

    /**
     * Get Asterisk version to check if it's running.
     */
    public function getVersion(): ?string
    {
        $result = $this->runCommand("core show version");
        if ($result['success'] && !empty($result['output'])) {
            return implode("\n", $result['output']);
        }
        return null;
    }

    /**
     * Parse PJSIP endpoints to get trunk status.
     */
    public function getEndpoints(): array
    {
        $result = $this->runCommand("pjsip show endpoints");
        if (!$result['success']) {
            return [];
        }

        $endpoints = [];
        $lines = $result['output'];
        
        // Very basic parser for Asterisk output
        // Endpoint:  <Endpoint/CID.....................................>  <State.....>  <Channels.>
        // Endpoint:  uztelecom                                            Not in use    0 of inf
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), 'Endpoint:')) {
                // Parse line like "Endpoint:  name  State  Channels"
                $parts = preg_split('/\s{2,}/', trim($line));
                if (count($parts) >= 3) {
                    $name = str_replace('Endpoint:', '', $parts[0]);
                    $name = trim($name);
                    $endpoints[] = [
                        'name' => $name,
                        'state' => trim($parts[1]),
                        'channels' => trim($parts[2] ?? '0'),
                    ];
                }
            }
        }

        return $endpoints;
    }

    /**
     * Get active calls count.
     */
    public function getActiveCallsCount(): int
    {
        $result = $this->runCommand("core show channels");
        if (!$result['success']) {
            return 0;
        }

        foreach ($result['output'] as $line) {
            if (preg_match('/(\d+)\s+active call/i', $line, $matches)) {
                return (int)$matches[1];
            }
        }

        return 0;
    }

    /**
     * Reload Asterisk dialplan.
     */
    public function reloadDialplan(): bool
    {
        $result = $this->runCommand("dialplan reload");
        return $result['success'];
    }

    /**
     * Restart Asterisk gracefully.
     */
    public function restartAsterisk(): bool
    {
        $result = $this->runCommand("core restart gracefully");
        return $result['success'];
    }
}
