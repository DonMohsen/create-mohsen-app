import gradient from "gradient-string";

 const TITLE_TEXT = `
    ____                   __  ___      __                   
   / __ \\____  ____       /  |/  /___  / /_  ________  ____ 
  / / / / __ \\/ __ \\     / /|_/ / __ \\/ __ \\/ ___/ _ \\/ __ \\
 / /_/ / /_/ / / / /    / /  / / /_/ / / / (__  )  __/ / / /
/_____/\\____/_/ /_/    /_/  /_/\\____/_/ /_/____/\\___/_/ /_/ 
`;
const THANKS = `
   ________                __                                          
  /_  __/ /_  ____ _____  / /_______                                
   / / / __ \\/ __ \`/ __ \\/ //_/ ___/                                
  / / / / / / /_/ / / / /  < (__  )                                
 /_/ /_/ /_/\\__,_/_/ /_/_/|_/____/                                  
                                                                             
`;
// const ENJOY = `
//     ______        _                 _   __             
//    / ________    (_____  __  __    / | / ____ _      __
//   / __/ / __ \\  / / __ \\/ / / /   /  |/ / __ | | /| / /
//  / /___/ / / / / / /_/ / /_/ /   / /|  / /_/ | |/ |/ / 
// /_____/_/ /___/ /\\____/\\__, /   /_/ |_|\\____/|__/|__/  
//            /___/      /____/                           
// `;


export const renderTitle = () => {
  const gradientTheme = {
    blue: "#add7ff",
    cyan: "#89ddff",
    green: "#5de4c7",
    magenta: "#fae4fc",
    red: "#d0679d",
    yellow: "#fffac2",
  };

  const Gradient = gradient(Object.values(gradientTheme));
  console.log(Gradient.multiline(TITLE_TEXT));
};
export const renderThanks = () => {
  const gradientTheme = {
    green: "#5de4c7",
    blue: "#add7ff",
    red: "#d0679d",
    yellow: "#fffac2",
    cyan: "#89ddff",
    magenta: "#fae4fc",
  };

  const Gradient = gradient(Object.values(gradientTheme));
  console.log(Gradient.multiline(THANKS));
};
