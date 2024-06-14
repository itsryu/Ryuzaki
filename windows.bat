@echo off

set dir=%~dp0

cd %dir% 

start cmd /k yarn build

pause

start cmd /k yarn start

exit 0