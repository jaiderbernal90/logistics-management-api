# Define las carpetas de origen
$carpetas = @(
    "C:\COORDINADORA\src",
    "C:\COORDINADORA\.github",
    "C:\COORDINADORA\.husky",
    "C:\COORDINADORA\test"

)

# Define los archivos en la raíz del backend
$archivosRaiz = @(
    "C:\COORDINADORA\.eslintrc.js",
    "C:\COORDINADORA\.eslintignore",
    "C:\COORDINADORA\.gitignore",
    "C:\COORDINADORA\.lintstagedrc",
    "C:\COORDINADORA\.prettierignore",
    "C:\COORDINADORA\.prettierrc",
    "C:\COORDINADORA\commitlint.config.js",
    "C:\COORDINADORA\docker-compose.yml",
    "C:\COORDINADORA\nest-cli.json",
    "C:\COORDINADORA\tsconfig.build.json",
    "C:\COORDINADORA\tsconfig.json"
)

# Nombre del archivo de salida
$archivoSalida = "contenido_proyecto.txt"

# Función para procesar archivos en una carpeta
function ProcesarCarpeta {
    param(
        [string]$carpeta
    )

    # Obtiene todos los archivos DIRECTAMENTE en la carpeta
    $archivos = Get-ChildItem -Path $carpeta -File

    # Itera sobre cada archivo
    foreach ($archivo in $archivos) {
        # Agrega la ruta del archivo al archivo de salida
        "Archivo: $($archivo.FullName) (Carpeta)" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
        "--------------------------------------------------" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8

        # Intenta leer el contenido del archivo y escribirlo DIRECTAMENTE en el archivo
        try {
            Get-Content $archivo.FullName -ErrorAction SilentlyContinue | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
        } catch {
            Write-Warning "Error al leer el archivo: $($archivo.FullName) - $($_.Exception.Message)"
            "Error al leer el archivo: $($archivo.FullName) - $($_.Exception.Message)" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
        }

        # Agrega una línea en blanco entre archivos
        "" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
        "" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
    }

    # Obtiene todas las subcarpetas DIRECTAMENTE en la carpeta
    $subcarpetas = Get-ChildItem -Path $carpeta -Directory

    # Itera sobre cada subcarpeta
    foreach ($subcarpeta in $subcarpetas) {
        # Llama recursivamente a la función ProcesarCarpeta para procesar la subcarpeta
        ProcesarCarpeta -carpeta $subcarpeta.FullName
    }
}

# Procesa la carpeta src del backend
foreach ($carpeta in $carpetas) {
    # Verifica si la carpeta existe
    if (Test-Path -Path $carpeta -PathType Container) {
        ProcesarCarpeta -carpeta $carpeta
    } else {
        Write-Warning "La carpeta no existe: $carpeta"
    }
}

# Procesa los archivos en la raíz del backend
Write-Host "Procesando archivos en la raíz del backend"
foreach ($archivo in $archivosRaiz) {
    # Agrega la ruta del archivo al archivo de salida
    "Archivo: $($archivo) (Raíz)" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
    "--------------------------------------------------" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8

    # Intenta leer el contenido del archivo y escribirlo DIRECTAMENTE en el archivo
    try {
        Get-Content $archivo -ErrorAction SilentlyContinue | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
    } catch {
        Write-Warning "Error al leer el archivo: $($archivo) - $($_.Exception.Message)"
        "Error al leer el archivo: $($archivo) - $($_.Exception.Message)" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
    }

    # Agrega una línea en blanco entre archivos
    "" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
    "" | Out-File -FilePath $archivoSalida -Append -Encoding UTF8
}