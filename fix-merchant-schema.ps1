$folder = "C:\Projects\wownanoceramic\public"

$oldOffers = '"offers":{"@type":"Offer","price":"99","priceCurrency":"RON","availability":"https://schema.org/InStock","url":"https://www.wownanoceramic.ro/"}'

$newOffers = '"offers":{"@type":"Offer","price":"99","priceCurrency":"RON","availability":"https://schema.org/InStock","url":"https://www.wownanoceramic.ro/","hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy","applicableCountry":"RO","returnPolicyCategory":"https://schema.org/MerchantReturnFiniteReturnWindow","merchantReturnDays":14,"returnMethod":"https://schema.org/ReturnByMail","returnFees":"https://schema.org/FreeReturn"},"shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"18.99","currency":"RON"},"shippingDestination":{"@type":"DefinedRegion","addressCountry":"RO"},"deliveryTime":{"@type":"ShippingDeliveryTime","handlingTime":{"@type":"QuantitativeValue","minValue":0,"maxValue":1,"unitCode":"DAY"},"transitTime":{"@type":"QuantitativeValue","minValue":1,"maxValue":1,"unitCode":"DAY"}}}}'

$files = Get-ChildItem -Path $folder -Filter "tratament-ceramic-auto-*.html"
$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match [regex]::Escape($oldOffers)) {
        $newContent = $content.Replace($oldOffers, $newOffers)
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
        $count++
    } else {
        Write-Host "⚠️  $($file.Name) — pattern negasit" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Gata! $count fisiere actualizate." -ForegroundColor Cyan
