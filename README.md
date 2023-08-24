# noheva-management

## Steps to run
1. git submodule update --init
2. npm i
3. npm run dev

[![Coverage Status](https://coveralls.io/repos/github/Metatavu/muisti-management/badge.svg)](https://coveralls.io/github/Metatavu/muisti-management)

![CodeBuild Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiSndMWjgyR2NvSzRlRCtKaDJpZnpPWEZsRG5QOXpXQTk4VnVXdGNoL1lHcGpoaHFJbEpLbjZKdlhpR3NxYldGWTB1dXVURW55M0ljYnpzb1VHcmtXeFhJPSIsIml2UGFyYW1ldGVyU3BlYyI6ImZsSWYzUG02ZlJHRHRONUUiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop "CodeBuild status")

## Upgrading CKEditor

If CKEditor needs upgrading use CKEditor's builder tool to build new package: https://ckeditor.com/cke4/builder

Builder tool has option to upload existing build-config.js to create bundle with all previously selected plugins and features. Use build-config.js from public/ckditor/build-config.js to ensure that new build contains same features as the previous one.

After building new zip bundle, replace ckeditor folder from public -folder with one from the zip and you are done.
