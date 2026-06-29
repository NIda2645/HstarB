param(
    [Parameter(Mandatory=$true)][string]$Old,
    [Parameter(Mandatory=$true)][string]$New
)

$secretPattern = '(?i)(KEY|TOKEN|SECRET|AK|SK|CREDENTIAL|PASSWORD)'

function Read-EnvMap([string]$Path) {
    $ordered = [ordered]@{}
    if (-not (Test-Path -LiteralPath $Path)) { return $ordered }
    foreach ($line in [System.IO.File]::ReadAllLines($Path, [System.Text.Encoding]::UTF8)) {
        $trim = $line.Trim()
        if (-not $trim -or $trim.StartsWith('#') -or -not $trim.Contains('=')) { continue }
        $parts = $line.Split('=', 2)
        $name = $parts[0].Trim()
        if ($name) { $ordered[$name] = $parts[1].Trim() }
    }
    return $ordered
}

$newMap = Read-EnvMap $New
$oldMap = Read-EnvMap $Old

foreach ($name in $oldMap.Keys) {
    if ($name -match $secretPattern -and $oldMap[$name]) {
        $newMap[$name] = $oldMap[$name]
    }
}

$lines = New-Object System.Collections.Generic.List[string]
foreach ($name in $newMap.Keys) {
    $lines.Add("$name=$($newMap[$name])")
}

$parent = Split-Path -Parent $New
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
[System.IO.File]::WriteAllLines($New, $lines, [System.Text.UTF8Encoding]::new($false))
