new Vue({
    el:'#app',
    data:{
        mapHistory:[]
    },
    created(){
        this.getWorldJson()
        this.mapHistory.push()
    },
    mounted(){},
    methods:{
        async getWorldJson(){
            // let {data:WorldMapJson} = await axios.get('../map-json/word-china.json')
            let {data:WorldMapJson} = await axios.get('/world-map/map-json/word-china.json')
            this.worldMap('worldMap','china',WorldMapJson,6,[104, 35])
        },
        /**
         * domId: 地图容器ID
         * mapName: 地图名称
         * mapJson: 地图数据
         * zoom: 地图放大倍数
         * mapCenter: 当前视角的中心点，用经纬度表示
         */
        worldMap(domId,mapName,mapJson,zoom,mapCenter){
            //初始化echarts实例
            var myChart = echarts.init(document.getElementById(domId));
            //注册地图
            echarts.registerMap(mapName, mapJson);  // mapName 如果不是china南海诸岛不会显示
            myChart.off('click') // 解绑事件处理函数。为了解决地图下钻会重复触发点击事件的问题
           // 单独给中国的省份加上渐变背景
            // 单独给中国的省份设置label颜色或者区域颜色
            var mapRegions = []

            //中国省份label
            var cityLabelColor= {
                normal: {
                    show: true,
                    color: 'rgba(255,255,255,1)'
                },
                emphasis: {
                    show: true,
                    color: 'rgba(255,255,255,1)'
                }
            }
              //中国省份区域颜色
            var cityItemStyle ={
                    normal: {
                        borderColor: 'rgba(147, 235, 248, 1)',
                        borderWidth: 1,
                        areaColor: {
                            type: 'radial',
                            x: 0.5,
                            y: 0.5,
                            r: 0.8,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(128, 217, 248, 1)',
                        // shadowColor: 'rgba(255, 255, 255, 1)',
                        shadowOffsetX: -2,
                        shadowOffsetY: 2,
                        shadowBlur: 10
                    },
                    emphasis: {
                        areaColor: '#389BB7',
                        borderWidth: 0
                    }
            }
            chinaProvince.forEach(function(item,index){
                var obj = {
                    name:item,
                    label:cityLabelColor,
                    itemStyle:cityItemStyle
                }
                mapRegions.push(obj,{name:'南海诸岛', label: cityLabelColor, itemStyle: cityItemStyle})
            })
            
            var foreignColor={
                areaColor: {
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: '#073684' // 0% 处的颜色
                    }, {
                        offset: 1,
                        color: '#061E3D' // 100% 处的颜色
                    }],
                },
                borderColor: '#215495',
                borderWidth: 1,
            }
            var option={
                geo: {
                    show: true,
                    map: mapName,  
                    nameMap: worldMapName,
                    label: {
                        normal: {
                            color:'rgba(255,255,255,.3)',
                            show: true,
                        },
                        emphasis: {
                            color:'rgba(255,255,255,.3)',
                            show: true,
                        }
                    },
                    zoom: zoom,
                    center: mapCenter, // 地图中心点,用于初始化的时候中国在视角中心
                    roam: true,
                    itemStyle: {
                        normal: foreignColor,
                        emphasis: foreignColor
                    },
                    regions: mapRegions
                }
            }
            //使用制定的配置项和数据显示图表
            myChart.setOption(option, true);
            // 监听地图的点击事件
            myChart.on('click', async (mdata)=> {
                let cityName = "";
                // console.log(cityMap)
                var cityMapKey = Object.keys(cityMap)
                // 检查点击的地图区域是不是中国的如果不是就return
                var flag = cityMapKey.some(item=>item == mdata.name)
                if(!flag) return;
                this.mapHistory.push(mdata.name)
                cityName = mdata.name
                // let { data:cityMapJson } = await axios.get(`../map-json/city-map/${cityMap[cityName]}.json`)
                let { data:cityMapJson } = await axios.get(`/world-map/map-json/city-map/${cityMap[cityName]}.json`)
                this.worldMap('worldMap','city',cityMapJson,null,null)
            })
        },
       async back(){
            this.mapHistory.pop()
           if(this.mapHistory.length < 1){
                this.getWorldJson()
           }else{
                let historyCityName = this.mapHistory[this.mapHistory.length -1]
                // let { data:cityMapJson } = await axios.get(`../map-json/city-map/${cityMap[historyCityName]}.json`)
                let { data:cityMapJson } = await axios.get(`/world-map/map-json/city-map/${cityMap[historyCityName]}.json`)
                this.worldMap('worldMap','city',cityMapJson,null,null)
           }
        }
    },
})
