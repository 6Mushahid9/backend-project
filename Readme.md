# Started on 28-6-2024

this is my first backend project

# Notes

## Setting up a project

1. we cannot puch empty folders on git, to do this we create a file inside named '.gitkeep'
2. make a '.gitignore' file that will not be pushed on github for security purposes, search gitignore generator on browser and create a file for node project, simply that and paste, can also add extra files as er requirement 
3. create a '.env' file to track environment variables from system (not files)
4. in whole project we want to use 'import' syntax therefore we will add ' "type": "module", ' in package.jason file
5. create a src folder to store all files at seperately
6. we have to reastart our server with every change, to solve this install 'nodemon' this will create a node_modules folder, now remove test and add "dev": "nodemon src/index.js" in scrips section of package.jason
7. create some basic folders in src like: controllers, db, middlewares, models, routes, utils, ...etc
8. install 'prettier' package to resolve later foramtting conflicts;  "npm i -D prettier"
   when you add this prettier package some extra things are to be done as well: 
   1. add '.prettierrc' and '.prettierignore' file in main project 