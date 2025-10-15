# Git Commands Script
Set-Location "E:\Maticus Media\Businesses\Evan Price\Hauln' Heavy\hauln-heavy-webiste-01\hauln-heavy-estimator"

Write-Host "Adding all changes..."
git add .

Write-Host "Committing changes..."
git commit -m "Add hazmat placards and transportation questions to both equipment and freight forms

- Added interactive tooltips to Freight form hazmat and transportation questions
- Enhanced tooltip functionality with hover effects and detailed explanations
- Ensured both Equipment & Machinery and Freight forms have consistent question layouts
- Fixed locations page with deselected defaults and improved dropdown readability
- Updated form state management for new fields across both forms"

Write-Host "Pushing to repository..."
git push -u origin main

Write-Host "Git operations completed!"

