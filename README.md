
# Cron Parser in TypeScript

This is a TypeScript application that parses a cron string and prints a human-readable list of times.

## Installation

- **Node.js** and **npm** need to be installed on your macOS. You can install them using the following steps:
  1. **Install Node.js**: Download the latest version of Node.js from [here](https://nodejs.org/), or use Homebrew:
     ```
      brew install node
     ```
  2. **Download the ZIP file** containing the project and extract it.
   - You can double-click the ZIP file to extract it, or run the following command in your terminal:
     ```
     unzip cron_parser_aravind.zip
     ```

 **RUN Applicaiton**:
   ```
    1. cd cron_parser_aravind
    2. npm install
    3. npm start "exp_and_command"

    Example: 
         npm start "*/15 1,10/2 1,15 * 1-5,6/1 /usr/bin/find"  
         
         provided argument expands to: minute hour dayofmonth month dayofweek command
   ```
 **Run Tests**:
    ```
        npm run test
    ```


