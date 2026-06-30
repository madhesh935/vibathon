# Restructure, Revert, and Push ResQMesh Script

# 1. Clean up nested .git folder inside resqmesh/backend to prevent indexing errors
if (Test-Path "resqmesh\backend\.git") {
    Remove-Item -Recurse -Force "resqmesh\backend\.git"
    Write-Host "Successfully removed nested resqmesh/backend/.git folder."
} else {
    Write-Host "resqmesh/backend/.git not found or already removed."
}

# 2. Clear Git cache for resqmesh/backend in case it was indexed as a submodule
Write-Host "Clearing Git cache for resqmesh/backend..."
git rm --cached -f resqmesh/backend 2>$null

# 3. Revert the requested commit
Write-Host "Reverting commit 4e25d8abd63b90b5d8e6348b5e94f873e617e6bf..."
git revert --no-edit 4e25d8abd63b90b5d8e6348b5e94f873e617e6bf
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to revert commit 4e25d8abd63b90b5d8e6348b5e94f873e617e6bf automatically."
    Write-Host "Please check if the commit ID is correct or if there are conflicts."
} else {
    Write-Host "Successfully reverted commit 4e25d8abd63b90b5d8e6348b5e94f873e617e6bf."
}

# 4. Stage all files, commit, and push
Write-Host "Running Git commands to push the combined workspace..."
git status
git add -A
git commit -m "Restructure repository: Combine frontend and resqmesh under parent directory"
git branch -M main
git push -u origin main

Write-Host "Done!"
