<?php

namespace App\Services\Asterisk;

use Illuminate\Support\Facades\Log;

class NetplanService
{
    /**
     * Get the current ens8 configuration from netplan files.
     * We assume there's a file like /etc/netplan/99-ens8-config.yaml or similar.
     */
    public function getEth1Config(): array
    {
        $config = [
            'ip' => '',
            'mask' => '255.255.255.128', // default mask for uztelecom
            'gateway' => '',
        ];

        try {
            // Find yaml files in /etc/netplan
            $output = null;
            $returnVar = null;
            exec('cat /etc/netplan/*.yaml 2>/dev/null', $output, $returnVar);

            if ($returnVar === 0 && !empty($output)) {
                $content = implode("\n", $output);
                
                // Simple regex to find ens8 config
                if (preg_match('/ens8:.*?addresses:\s*\[?[\'"]?([0-9\.]+)\/([0-9]+)[\'"]?\]?/s', $content, $matches)) {
                    $config['ip'] = $matches[1];
                    $cidr = (int)$matches[2];
                    $config['mask'] = $this->cidrToMask($cidr);
                }

                // looking for via
                if (preg_match('/ens8:.*?routes:.*?via:\s*([0-9\.]+)/s', $content, $matches)) {
                    $config['gateway'] = $matches[1];
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to read netplan: " . $e->getMessage());
        }

        return $config;
    }

    /**
     * Generate and apply a new netplan configuration for ens8.
     */
    public function updateEth1Config(string $ip, string $mask, string $gateway): bool
    {
        $cidr = $this->maskToCidr($mask);
        $address = "{$ip}/{$cidr}";

        $yaml = <<<YAML
network:
  version: 2
  ethernets:
    ens8:
      addresses:
        - $address
      routes:
        - to: 0.0.0.0/0
          via: $gateway
          metric: 200
      nameservers:
        addresses: []
YAML;

        $tmpFile = '/tmp/99-ens8-config.yaml';
        file_put_contents($tmpFile, $yaml);

        $output = [];
        $returnVar = -1;
        
        exec("sudo mv {$tmpFile} /etc/netplan/99-ens8-config.yaml 2>&1", $output, $returnVar);
        
        if ($returnVar !== 0) {
            Log::error("Failed to move netplan file", ['output' => $output]);
            return false;
        }

        exec("sudo netplan apply 2>&1", $output, $returnVar);
        
        if ($returnVar !== 0) {
            Log::error("Failed to apply netplan", ['output' => $output]);
            return false;
        }

        Log::info("Netplan updated and applied for ens8", ['ip' => $ip, 'gateway' => $gateway]);
        return true;
    }

    private function cidrToMask(int $cidr): string
    {
        $bin = str_pad(str_repeat('1', $cidr), 32, '0');
        $parts = str_split($bin, 8);
        return implode('.', array_map('bindec', $parts));
    }

    private function maskToCidr(string $mask): int
    {
        $cidr = 0;
        foreach (explode('.', $mask) as $octet) {
            $cidr += substr_count(decbin((int)$octet), '1');
        }
        return $cidr;
    }
}

