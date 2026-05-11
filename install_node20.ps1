# Download and install Node.js 20 LTS portable
$nodeVersion = "20.18.0"  # Latest LTS as of 2026
$url = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip"
$zipPath = "$env:TEMP\node-v$nodeVersion-win-x64.zip"
$extractPath = "$env:USERPROFILE\node20"

Write-Host "Downloading Node.js $nodeVersion..."
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force

Write-Host "Installing to $extractPath..."
Move-Item -Path "$env:TEMP\node-v$nodeVersion-win-x64" -Destination $extractPath -Force

# Add to PATH temporarily for this session
$env:PATH = "$extractPath;$env:PATH"

Write-Host "Node.js $nodeVersion installed. Verifying..."
node --version
npm --version

Write-Host "Installation complete. You may need to restart terminals or add to PATH permanently."