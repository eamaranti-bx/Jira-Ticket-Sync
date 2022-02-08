# Jira Ticket Sync

 A Figma plugin to sync your Jira tickets with Figma.

## Summary

Jira Ticket Sync allows agile design teams to bridge the gap between Jira and Figma.  
Add your Jira tickets directly in Figma. Make changes to your ticket in the Jira board and sync the changes in Figma.

## Development

If you have ideas for new features, feel free to contact me on bittner.lukas@gmail.com. I am always happy to collaborate!

The plugin is developed using Webpack and React. 
It is accessing the Jira API via a Firebase function. Here is the link to the [Firebase code](https://github.com/lukasbittner/firebase-function-figma).  
The UI components are based on the React library made by [Alexandr Tovmach](https://github.com/alexandrtovmach/react-figma-plugin-ds).


## Compile

```
npx webpack --mode=development --watch # build for development
npx webpack --mode=production # build or publishing
```

