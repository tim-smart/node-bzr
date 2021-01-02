# node-bzr

A simple node wrapper around the `bzr` source code management tool.

## Usage

```typescript
import Bzr from "bzr";

const bzr = Bzr("path/to/working/directory");

bzr
  .raw(["branch", "lp:myrepo"])
  .then(() => {
    console.log("Code copied!");
    return bzr.tags();
  })
  .then((tags) => {
    console.log("Here are the tags:", tags);
  });
```
