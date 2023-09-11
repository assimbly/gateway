@echo off

if [%1]==[] goto usage
git pull
git add -A
git commit -m %1
git push
goto :eof
:usage
@echo Usage: %0 ^<Commit Message^>
exit /B 1

