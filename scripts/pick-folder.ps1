param([string]$DefaultPath = "")
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.FolderBrowserDialog
$f.Description = "Select folder to save data.json"
$f.ShowNewFolderButton = $true
if ($DefaultPath -and (Test-Path $DefaultPath)) {
  $f.SelectedPath = $DefaultPath
}
if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $f.SelectedPath
} else {
  Write-Output ""
}
