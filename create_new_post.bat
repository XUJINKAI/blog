@echo by XUJINKAI
@echo Add a md file to _posts or _drafts
@echo off

:1
set /p fdid=Create a post(1) or draft(2):
if %fdid%==1 set fd=_posts&& goto 2
if %fdid%==2 set fd=_drafts&& goto 2
goto 1
:2
set /p title=Input new post's title: 
set dt=%date:~,4%-%date:~5,2%-%date:~8,2%
set time0=%time: =0%
set hms=%time0:~,2%:%time0:~3,2%:%time0:~6,2%
set file=%dt%-%title%.md
set fpath="%fd%/%file%"

echo --->> %fpath%
echo layout: post>> %fpath%
echo published: true>> %fpath%
echo comment: true>> %fpath%
echo sticky: false>>%fpath%
echo permalink: >> %fpath%
echo title: %title%>> %fpath%
echo tags: >> %fpath%
echo date: %dt% %hms% +0800>> %fpath%
echo --->> %fpath%
echo ^<!--more--^>>> %fpath%

cd %fd%
start "" "%file%"
