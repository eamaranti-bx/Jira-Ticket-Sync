# Jira Ticket Sync

 A Figma plugin to sync your Jira tickets on Figma.

## Summary

Jira Ticket Sync allows agile design teams to bridge the gap between Jira and Figma.
Add your Jira tickets directly in Figma alongside the design screens to which they belong to. 
Make changes in the Jira board and automatically update the tickets in Figma.

## Development

If you have new feature ideas, feel free to contact me on (bittner.lukas@gmail.com). I am always happy to collaborate!

The plugin is developed using Webpack and React. 
It is accessing the Jira API via a Firebase function. Here is the link to the [Firebase code](https://github.com/lukasbittner/firebase-function-figma).

## Compile

```
npx webpack --mode=development --watch # build for development
npx webpack --mode=production # build or publishing
```

