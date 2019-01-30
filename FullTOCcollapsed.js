let loadedURLs = [], myMapView                 
require([
    //Require API parameters    
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/core/watchUtils",
    "esri/request",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/geometry/Extent",
    "esri/widgets/Search"
],

//Require Method 
function(Map,
    MapView,
    SceneView,
    watchUtils,
    esriRequest,
    MapLayer,
    FeatureLayer,
    Legend,
    Extent,
    Search)

//Map, Viewport Declarations 
    {   map = new Map({
        basemap: 'osm'
    });
    myMapView = new MapView({
        id: 'mapView',
        container: 'mapViewDiv',
        zoom: 11,
        center: [-122.88989, 47.02454],
        map: map,
    });
    let toc = document.getElementById("toc")
    let svrURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/?f=json"
    let options = {responseType: "json"}
    var svcLst = []
    function svcRequst(){
        esriRequest(svrURL,options).then(response => {
        let services = response.data.services
        for (let i=0;i<services.length;i++){
            if (services[i].type =="MapServer"){
                let table = document.createElement("table")
                svcLst.push(services[i].name)
                var row = document.createElement("tr")
                var cell = document.createElement("th")
                row.setAttribute("id", "row")
                table.setAttribute("class","toctable")
                table.setAttribute("id",services[i].name)
                cell.setAttribute("id", "cell")
                cell.innerHTML = services[i].name
                row.appendChild(cell)
                table.appendChild(row)
                toc.appendChild(table)
                }
            }
        let tables = document.getElementsByClassName("toctable")
        lyrRequest(svcLst, tables)
            }
        )
    }
    function lyrRequest(svcLst, tables){
        for (let x=0;x<tables.length;x++){
                let table = tables[x]
                let service = table.id
                let queryURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"+table.id+"/MapServer?f=pjson"
                let queryOptions = {responseType: "json"}
                esriRequest(queryURL,queryOptions).then(response => {
                    for (let z=0;z<response.data.layers.length;z++){
                        lyrRow = document.createElement("tr")
                        lyrCell = document.createElement("td")
                            lyrCell.innerHTML = response.data.layers[z].name
                            lyrCell.style.fontFamily = 'sans-serif';
                            lyrCell.setAttribute("id","lyrCell")
                            lyrCell.style.fontSize = "12pt"
                            lyrCell.style.textAlign = "left"
                            lyrRow.appendChild(lyrCell)
                            table.appendChild(lyrRow)
                        if(response.data.layers[z].subLayerIds == null){
                            lyrCell.style.color = "gray";
                            onOff = document.createElement("input");
                            onOff.layerName = response.data.layers[z].name
                            onOff.layerId = response.data.layers[z].id
                            onOff.service = table.id
                            onOff.type = "checkbox"
                            onOffCell = document.createElement("td")
                            onOffCell.appendChild(onOff);
                            lyrRow.append(onOffCell)
                            onOff.addEventListener("change",function (e) {
                                let svcURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"  + e.target.service + "/MapServer/"
                                //if (loadedURLs.includes(svcURL) == false){
                                    loadedURLs.push(svcURL)
                                    mapLayer = new MapLayer({
                                        url: svcURL
                                        })
                                    map.add(mapLayer)
                                    mapLayer.when(mapLayer.allSublayers.items[e.target.layerId].visible = e.target.checked)
                            
                            })                           
                        }
                    } 
                }   
            )
        }
    }
function checkService(e){console.log(e.target)
    let svcURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"  + service + "/MapServer/"
    if (loadedURLs.includes(svcURL)){}
    else{
        mapLayer = new MapLayer({
            url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"  + service + "/MapServer/"
                }) 
        map.add(mapLayer)
        loadedURLs.push(svcURL)}
    }  
svcRequst() 
})