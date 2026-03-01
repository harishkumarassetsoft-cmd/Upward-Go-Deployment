# sync-frontend.ps1
# Run from c:\Upward-Go to push local source edits into the Docker container.

Write-Host "Syncing frontend files into Docker container..." -ForegroundColor Cyan

$files = @(
    @{ src = "Frontend\src\pages\Buyers.tsx";              dst = "/app/src/pages/Buyers.tsx" },
    @{ src = "Frontend\src\pages\SalesList.tsx";           dst = "/app/src/pages/SalesList.tsx" },
    @{ src = "Frontend\src\pages\Properties.tsx";          dst = "/app/src/pages/Properties.tsx" },
    @{ src = "Frontend\src\components\BuyerFlowModal.tsx"; dst = "/app/src/components/BuyerFlowModal.tsx" }
)

foreach ($f in $files) {
    docker cp "c:\Upward-Go\$($f.src)" "upward-go-frontend-1:$($f.dst)"
    Write-Host "  OK: $($f.src)" -ForegroundColor Green
}

docker exec upward-go-frontend-1 touch /app/src/main.tsx
Write-Host "Done - refresh localhost:3000" -ForegroundColor Green
