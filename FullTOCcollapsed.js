let myMapView, mapLayer       
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
    "esri/widgets/Search",
    "esri/geometry/projection",
    "esri/widgets/Popup",

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
    Search,
    Project,
    Popup)

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
    let legend = new Legend({
        view: myMapView
    });
    myMapView.ui.add(legend, "bottom-right");

    let search = new Search({
        view: myMapView
    });
    myMapView.ui.add(search, "bottom-left");
    let toc = document.getElementById("toc")
    let svrURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/?f=json"
    let options = {responseType: "json"}
    function buildTables(){
        esriRequest(svrURL,options).then(response => {
        let services = response.data.services
        for (let i=0;i<services.length;i++){
            if (services[i].type =="MapServer"){
            let service = services[i].name
            //table attributes
                let table = document.createElement("table")
                table.setAttribute("class","toctable")
                table.setAttribute("id",services[i].name)
            //row attributes
                let row = document.createElement("tr")
                row.setAttribute("id", "row")
            //cell attributes    
                var cell = document.createElement("th")
                cell.setAttribute("id", "cell")
                cell.innerHTML = services[i].name
            //append new table
                row.appendChild(cell)
                table.appendChild(row)
                toc.appendChild(table)
            let queryURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"+service+"/MapServer?f=pjson"
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
                            lyrRow.innerHTML = ""
                            lyrCell = document.createElement("td")
                            lyrCell.style.color = "gray";
                            lyrCell.innerHTML = response.data.layers[z].name
                            onOff = document.createElement("input");
                            onOff.layerName = response.data.layers[z].name
                            //console.log(onOff.layerName)
                            onOff.layerId = response.data.layers[z].id
                            onOff.type = "checkbox"
                            onOffCell = document.createElement("td")
                            onOffCell.appendChild(onOff);
                            lyrRow.appendChild(lyrCell)
                            lyrRow.appendChild(onOffCell)
                            table.appendChild(lyrRow)
                            onOff.addEventListener("change",function (e) {
                                //console.log(e.target.layerName)                     
                                checkLoad(service,e)
                                
                                checkUnload(service, queryURL)     
                                })
                            }
                        }
                    })
                }
            }
        }) 
    }
function checkLoad(service,e){
    let b = false
    let svcURL = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/"  + service + "/MapServer/" 
    if(map.layers.items.length==0){
        loadService(svcURL)
    }  
    else{
        for (let i=0; i<map.layers.length;i++){
            if (map.layers.items[i].url+"/" == svcURL){
                        b = true
                    } 
                }       
        if (b == false){
            loadService(svcURL)
        }  
    }
    checkVisible(e.target, service, svcURL)
}

function loadService(svcURL){
    mapLayer = new MapLayer({
                    url: svcURL
                    })
    map.add(mapLayer)
    //project layer
    watchUtils.when(mapLayer,"loaded",function(){
        let url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/project";
        let fullExtent = mapLayer.fullExtent
        let options = {
            responseType: "json", 
                query: {
                    f: "json",
                    inSR: JSON.stringify(fullExtent.spatialReference),
                    outSR: 102100,
                    geometries: JSON.stringify({
                            "geometryType" : "esriGeometryPoint",
                            "geometries" : [
                            {"x" : fullExtent.xmin, "y" : fullExtent.ymin},
                            {"x" : fullExtent.xmax, "y" : fullExtent.ymax}
                            ]
                            })
                }
            };
        esriRequest(url,options).then(response => {
            let fe = {}
            let data = response.data
            fe.xmin = data.geometries[0].x;
            fe.ymin = data.geometries[0].y;
            fe.xmax = data.geometries[1].x;
            fe.ymax = data.geometries[1].y;
            fe.spatialReference = 102100
            let layerExtent = new Extent(fe)
            myMapView.goTo(layerExtent)
        })
    for (let i = 0; i<mapLayer.allSublayers.items.length;i++){
        if(mapLayer.allSublayers.items[i].sublayers == null){
            mapLayer.allSublayers.items[i].visible = false; 
            }
    }
    })
                }
function checkVisible(target,service, svcURL){
     for(let i=0; i<map.layers.items.length;i++){
         if (map.layers.items[i].url+"/" == svcURL){
             watchUtils.when(map.layers.items[i],"loaded",function(){
                 for(let x = 0;x<map.layers.items[i].allSublayers.items.length;x++){
                     if(map.layers.items[i].allSublayers.items[x].title == target.layerName){
                       map.layers.items[i].allSublayers.items[x].visible = target.checked
                     }}
                })   
            }
        }
    }
function checkUnload(service,queryURL){
    c=false
    let tables = document.getElementsByClassName("toctable")
    for (let a=0;a<tables.length;a++){
        if(tables[a].id == service){
            for(let b = 0;b<tables[a].rows.length;b++){
                let row = tables[a].rows[b]
                if(row.cells.length>1){
                    if (row.cells[1].firstElementChild.checked == true){ 
                       c=true
                    }
                }
                
            }
        }
    }
    if (c != true){
        for (let i=0; i<map.layers.items.length;i++){
            if(map.layers.items[i].url+"?f=pjson" == queryURL){
                map.remove(map.layers.items[i])
            }
        }
    }
}
buildTables()
})

