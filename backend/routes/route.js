const express = require("express");
const fs = require('fs');
const axios = require('axios');

const path = require("path");
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you create a new record.
router.route("/geturl").get(function (req, response) {

  fs.readFile(req.query.fname + ".googlemap", { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      console.log('received data: ' + data);
      response.json({ status: "ok", data: data });
    } else {
      response.json({ status: "error"});
    }
  });
});
router.route("/test").get(function (req, response) {
  const configFile = fs.readFileSync('config.txt', 'utf-8');
  response.json(configFile);
});
router.route("/postdata").post(async (req, response) => {

  let data = req.body.data;
  const API_KEY = "YOUR_GOOGLE_MAP_API_KEY";
  const permute = (arr, l = 0, r = arr.length - 1, result = []) => {
    if (l === r) {
      result.push([...arr]);
    } else {
      for (let i = l; i <= r; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]];
        permute(arr, l + 1, r, result);
        [arr[l], arr[i]] = [arr[i], arr[l]];
      }
    }
    return result;
  }
  const mids = [...data];
  mids.splice(mids.length - 1, 1);
  mids.splice(0, 1);
  const permuted = permute(mids);
  const routeCoods = permuted.map(elem => [data[0], ...elem, data[data.length - 1]]);
  const fname = (new Date()).getTime();
  response.json(fname);
  
  const distances = await Promise.all(routeCoods.map(async routeCood => {
    const coords = routeCood.map((cur, i, arr) => {
      if (i == 0) return undefined;
      return { origin: arr[i - 1], dest: cur };
    }).filter(elem => elem != undefined);
    console.log(coords);
    const urls = coords.map(elem => {
      return `https://maps.googleapis.com/maps/api/distancematrix/json?mode=driving&origins=${elem.origin.lat}%2C${elem.origin.lng}&destinations=${elem.dest.lat}%2C${elem.dest.lng}&key=${API_KEY}`;
    });
    console.log(coords);
    const sumAsyncResponses = async () => {
      try {
        const responses = await Promise.all(urls.map(url => axios.get(url)));
        const sum = responses.reduce((total, response) => total + response.data.rows[0].elements[0].distance.value, 0);
        return sum;
      } catch (err) {
        console.error(err);
      }
    };

    return {sum:await sumAsyncResponses(),path:routeCood};
  }));
  console.log(distances);
  min_dist=99999999;let path={};
for(let i=0;i<distances.length;i++){
if(min_dist>distances[i].sum){
  min_dist=distances[i].sum;
  path=distances[i].path;
}
}
const lastI=path.length-1;
const ways=[...path];
ways.splice(lastI,1);
ways.splice(0,1);
const waypoints=encodeURI(ways.reduce((total,cur) => total+"|"+cur.lat+","+cur.lng,"").substring(1));
const url=`https://www.google.com/maps/dir/?api=1&origin=${path[0].lat},${path[0].lng}&destination=${path[lastI].lat},${path[lastI].lng}&travelmode=driving&waypoints=${waypoints}`;

console.log(url);
fs.writeFile(fname+".googlemap", url, (err) => {
  if (err) console.log(err.message);
});

});

module.exports = router;
