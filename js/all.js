//sidebar顯示資料製作
function renderDay() {
    var date = new Date();
    var day = date.getDay();
    var chineseDay = changeDay(day);
    var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    document.querySelector('span').textContent = chineseDay;
    document.querySelector('.today').textContent = today;

    //判斷奇數偶數天
    if (day == 2 || day == 4 || day == 6) {
        document.querySelector('.even').style.display = 'block';
    } else if (day == 1 || day == 3 || day == 5) {
        document.querySelector('.odd').style.display = 'block';
    } else {
        document.querySelector('.all').style.display = 'block';
    }
}

function changeDay(day) {
    if (day == 1) {
        return "一"
    } else if (day == 2) {
        return "二"
    } else if (day == 3) {
        return "三"
    } else if (day == 4) {
        return "四"
    } else if (day == 5) {
        return "五"
    } else if (day == 6) {
        return "六"
    } else if (day == 7) {
        return "日"
    } else {
        return
    }
}

//抓取ajax資料
var data;
function getData() {
    var xhr = new XMLHttpRequest;
    xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
    xhr.send(null);
    xhr.onload = function () {
        data = JSON.parse(xhr.responseText).features;
        var len = data.length;
        var markers = new L.MarkerClusterGroup().addTo(map);
        for (var i = 0; i < len; i++) {  //辨識口罩剩餘數量調整座標顏色
            var mask;
            if (data[i].properties.mask_adult == 0 || data[i].properties.mask_child == 0){
                mask = goldIcon;
            } else if (data[i].properties.mask_child == 0 && data[i].properties.mask_adult != 0){
                mask = redIcon;
            }else{
                mask = greenIcon;
            }
            markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: mask })
                .bindPopup(`<h1>${data[i].properties.name}</h1><p class="storeInfo">${data[i].properties.address}</p>
                 <p class="storeInfo">${data[i].properties.phone}</p>
                 <p class="storeInfo">${data[i].properties.note}</p>
                 <div class="mask">
                    <div id="adultMask">
                        <span class="adult">成人口罩</span><span>${data[i].properties.mask_adult}個</span>
                    </div>
                    <div id="childMask">
                        <span class="child">兒童口罩</span><span>${data[i].properties.mask_child}個</span>
                     </div>
                </div>`));
        }  
        areaCounty();
        renderList();
    }
}

// 將藥局資料顯示出來
function renderList() {
    var str = "";
    for (var i = 0; i < data.length; i++) {
        str += `<li class="hospital">
                 <div class="shop">
                    <h3>${data[i].properties.name}</h3>
                    <img class="locationArrow" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" data-lat=${data[i].geometry.coordinates[1]} data-lng=${data[i].geometry.coordinates[0]}>
                 </div >
                 <p class="storeInfo">${data[i].properties.address}</p>
                 <p class="storeInfo">${data[i].properties.phone}</p>
                 <p class="storeInfo">${data[i].properties.note}</p>
                <div class="mask">
                    <div id="adultMask">
                        <span class="adult">成人口罩</span><span>${data[i].properties.mask_adult}個</span>
                    </div>
                    <div id="childMask">
                        <span class="child">兒童口罩</span><span>${data[i].properties.mask_child}個</span>
                     </div>
                </div>
            </li >`
    }
    document.querySelector('.list').innerHTML = str;
}


//篩選各縣市與行政區至select選單中
function areaCounty() {
    var set = new Set();
    var result = data.filter(item => !set.has(item.properties.county) ? set.add(item.properties.county) : false);
    // 過濾出各縣市，且不要重複出現
    var resultleng = result.length;
    var str = '';
    for (var i = 0; i < resultleng; i++) {
        if (result[i].properties.county == "") { continue }
        else {
            var preset = '<option value="">--請選擇縣市--</option>';
            var presetTown = '<option value="">--請選擇行政區--</option>';
            str += '<option value=' + result[i].properties.county + '>' + result[i].properties.county + '</option>';
        }
        // 依照順序將各區填入
        document.querySelector('.county').innerHTML = preset + str;
        document.querySelector('.countyTown').innerHTML = presetTown;
    }
}

document.querySelector('.county').addEventListener('change', areaTown, false)

//篩選各縣市區至選單中
function areaTown(e) {
    e.preventDefault;
    var select = e.target.value;
    var set = new Set();
    var result = data.filter(item => !set.has(item.properties.town) ? set.add(item.properties.town) : false);
    var len = result.length;
    var str = '';
    var info = '';
    for (var i = 0; i < len; i++) {
        if (select === result[i].properties.county) {
            map.setView([result[i].geometry.coordinates[1], result[i].geometry.coordinates[0]], 12);
            var presetTown = '<option value="">--請選擇行政區--</option>';
            str += '<option value=' + result[i].properties.town + '>' + result[i].properties.town + '</option>';
            info += `<li class="hospital">
                 <div class="shop">
                    <h3>${result[i].properties.name}</h3>
                    <img class="locationArrow" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" data-lat=${data[i].geometry.coordinates[1]} data-lng=${data[i].geometry.coordinates[0]}>
                 </div >
                 <p class="storeInfo">${result[i].properties.address}</p>
                 <p class="storeInfo">${result[i].properties.phone}</p>
                 <p class="storeInfo">${result[i].properties.note}</p>
                <div class="mask">
                    <div id="adultMask">
                        <span class="adult">成人口罩</span><span>${result[i].properties.mask_adult}個</span>
                    </div>
                    <div id="childMask">
                        <span class="child">兒童口罩</span><span>${result[i].properties.mask_child}個</span>
                     </div>
                </div>
            </li >`
        }
        // 依照順序將各區填入
        document.querySelector('.countyTown').innerHTML = presetTown + str;
        document.querySelector('.list').innerHTML = info;
    }
}

document.querySelector('.countyTown').addEventListener('change', areaCountyTown, false)

//篩選各行政區區至選單中
function areaCountyTown(e) {
    e.preventDefault;
    var select = e.target.value;
    var len = data.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        if (select == data[i].properties.town) {
            map.setView([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], 12);
            str += `<li class="hospital">
                 <div class="shop">
                    <h3>${data[i].properties.name}</h3>
                    <img class="locationArrow" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" data-lat=${data[i].geometry.coordinates[1]} data-lng=${data[i].geometry.coordinates[0]}>
                 </div >
                 <p class="storeInfo">${data[i].properties.address}</p>
                 <p class="storeInfo">${data[i].properties.phone}</p>
                 <p class="storeInfo">${data[i].properties.note}</p>
                <div class="mask">
                    <div id="adultMask">
                        <span class="adult">成人口罩</span><span>${data[i].properties.mask_adult}個</span>
                    </div>
                    <div id="childMask">
                        <span class="child">兒童口罩</span><span>${data[i].properties.mask_child}個</span>
                     </div>
                </div>
            </li >`
        }
        document.querySelector('.list').innerHTML = str;
    }
}

//點擊進行地圖導航
document.querySelector('.list').addEventListener('click', locationArrow, false)

function locationArrow(e){
    e.preventDefault
        if (e.target.nodeName == 'IMG') { 
            map.setView([e.target.dataset.lat, e.target.dataset.lng], 16);
    }
}  
    

//初始化
function init() {
    renderDay();
    getData();
}

init()

//圖資
// 建立 Leaflet 地圖
var map = L.map('map'); // 對照 index.html 第 57 行的 id 名稱

// 設定起始經緯度座標
map.setView(new L.LatLng(25.050481270355785, 121.51874735665464), 16);

// 設定圖資來源
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osm = new L.TileLayer(osmUrl, { minZoom: 1, maxZoom: 20 });
map.addLayer(osm);


//設定座標顏色
var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var goldIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});




