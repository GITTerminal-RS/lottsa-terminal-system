# Restaurar backup de Supabase (.backup.gz) en un proyecto nuevo
# Soporta volcados SQL (psql) y binarios (pg_restore)
#
# Uso:
#   .\scripts\restore-supabase-backup.ps1 `
#     -BackupGzPath "C:\ruta\db_cluster.backup.gz" `
#     -ProjectRef "drdluixfeolnwcwxhgeg" `
#     -DbPassword "tu_password"

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupGzPath,

    [Parameter(Mandatory = $true)]
    [string]$ProjectRef,

    [Parameter(Mandatory = $true)]
    [string]$DbPassword,

    # Opcional: host del Session pooler (Supabase -> Connect -> Session mode)
    # Proyecto drdluixfeolnwcwxhgeg (sa-east-1): aws-1-sa-east-1.pooler.supabase.com
    [string]$PoolerHost = "aws-1-sa-east-1.pooler.supabase.com"
)

$pgBin = "C:\Program Files\PostgreSQL\16\bin"
$pgRestore = Join-Path $pgBin "pg_restore.exe"
$psql = Join-Path $pgBin "psql.exe"

if (-not (Test-Path $pgRestore)) {
    Write-Host "ERROR: No se encontro PostgreSQL 16 en $pgBin" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackupGzPath)) {
    Write-Host "ERROR: No existe el archivo: $BackupGzPath" -ForegroundColor Red
    exit 1
}

$backupDir = Split-Path $BackupGzPath -Parent
$backupFile = Join-Path $backupDir ([IO.Path]::GetFileNameWithoutExtension($BackupGzPath))

Write-Host ""
Write-Host "=== PASO 1: Descomprimir backup ===" -ForegroundColor Cyan
if (Test-Path $backupFile) {
    Write-Host "Ya existe: $backupFile"
} else {
    Write-Host "Descomprimiendo..."
    $inputStream  = [System.IO.File]::OpenRead($BackupGzPath)
    $outputStream = [System.IO.File]::Create($backupFile)
    $gzip         = New-Object System.IO.Compression.GzipStream($inputStream, [IO.Compression.CompressionMode]::Decompress)
    $gzip.CopyTo($outputStream)
    $gzip.Close(); $inputStream.Close(); $outputStream.Close()
    Write-Host "Listo: $backupFile" -ForegroundColor Green
}

$firstLine = Get-Content $backupFile -TotalCount 3 -ErrorAction SilentlyContinue
$isSqlDump = ($firstLine -join "`n") -match "PostgreSQL database cluster dump|PostgreSQL database dump|^--"

Write-Host ""
Write-Host "=== PASO 2: Restaurar en Supabase ===" -ForegroundColor Cyan
Write-Host "Proyecto: $ProjectRef"
Write-Host "Tipo: $(if ($isSqlDump) { 'SQL (psql)' } else { 'Binario (pg_restore)' })"
Write-Host "Esto puede tardar varios minutos..."
Write-Host ""

$encodedPassword = [uri]::EscapeDataString($DbPassword)

if ($PoolerHost) {
    # Session pooler (IPv4) — recomendado en Windows sin IPv6
    $conn = "postgresql://postgres.${ProjectRef}:${encodedPassword}@${PoolerHost}:5432/postgres"
    Write-Host "Conexion: Session pooler ($PoolerHost)" -ForegroundColor Yellow
} else {
    $conn = "postgresql://postgres:${encodedPassword}@db.${ProjectRef}.supabase.co:5432/postgres"
    Write-Host "Conexion: directa db.* (si falla DNS, usa -PoolerHost)" -ForegroundColor Yellow
}

if ($isSqlDump) {
    # Errores de roles/objetos existentes son normales en restores de Supabase
    $env:PGPASSWORD = $DbPassword
    & $psql "-d" $conn "-f" $backupFile
} else {
    & $pgRestore `
        --verbose `
        --clean `
        --if-exists `
        --no-owner `
        --no-privileges `
        --dbname=$conn `
        $backupFile
}

$code = $LASTEXITCODE
Write-Host ""
if ($code -ne 0) {
    Write-Host "Restauracion termino con codigo $code." -ForegroundColor Yellow
    Write-Host "Muchos errores sobre roles/tablas existentes son NORMALES."
    Write-Host "Lo importante: revisa Table Editor en Supabase."
} else {
    Write-Host "Restauracion completada." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== PASO 3: Verificar ===" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/$ProjectRef/editor"
Write-Host "Busca tablas: malla, noticias, operadora, horarios, cartelera"
Write-Host ""
Write-Host "=== PASO 4: Variables para la app ===" -ForegroundColor Cyan
Write-Host "VITE_APP_SUPABASE_URL=https://${ProjectRef}.supabase.co"
Write-Host "VITE_APP_SUPABASE_ANON_KEY=(Settings -> API -> anon public)"
Write-Host "Render -> Manual Deploy despues de actualizar variables"
