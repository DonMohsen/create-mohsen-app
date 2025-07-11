const basePackageJson = {
    name: 'my-app', // will be replaced with projectName
    version: '0.1.0',
    private: true,
    scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
    },
    dependencies: {
        next: '14.0.0',
        react: '18.2.0',
        'react-dom': '18.2.0',
    },
};
export const TITLE_TEXT = `
   ______                __          ____                       __         ___              
  / ____________  ____ _/ /____     / __ \\____  _________ _____/ ____     /   |  ____  ____ 
 / /   / ___/ _ \\/ __ / __/ _ \\   / / / / __ \\/ ___/ __ / __  / __ \\   / /| | / __ \\/ __ \\
/ /___/ /  /  __/ /_/ / /_/  __/  / /_/ / /_/ / /  / /_/ / /_/ / /_/ /  / ___ |/ /_/ / /_/ /
\\____/_/   \\___/\\__,_/\\__/\\___/  /_____/\\____/_/   \\__,_/\\__,_/\\____/  /_/  |_/ .___/ .___/ 
                                                                             /_/   /_/      
`;
export const DEFAULT_APP_NAME = "my-dorado-app";
export const CREATE_DORADO_APP = "create-dorado-app";
