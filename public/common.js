var socket = io();
socket.emit("data",{data:"hello world"});
/**đường dẫn url hiện tại */
const thisURL = window.location.origin;
$(document).ready(function () {
    Init();
    $('#modal_processing').modal('hide');


});
/**
 * Ẩn hiện modal
 * @param {*} id 
 * @param {*} isShow 
 */
function showHideModal(id,isShow){
    if(isShow){
        $('#'+id).modal('show');
    }else{
        setTimeout(() => {
            $('#'+id).modal('hide');
        }, 1000);
    }
}
/**
 * Hàm khởi tạo
 */
function Init(){
    showHideModal('modal_processing',true);
    //B1: Lấy danh sách serial
    getListSerial((list)=>{
        //console.log(list);
        if(list && list.length>0){
            // B2: tiếp tục lấy danh sách dữ liệu
            $("#div_list_serial").empty();
            list.forEach(element => {
                const btn = document.createElement("button");
                    btn.onclick=function (e) {
                    Step3ShowChart(element);
                  };
                  btn.innerText= element;
                  btn.classList.add("btn", "btn-primary");
                $("#div_list_serial").append( btn);
            });
            showHideModal('modal_processing',false);
        }else{
            showHideModal('modal_processing',false);
            alert("Không lấy được danh sách TB!")
        }
    });
 }
 var myTempChart;
/**
 * Hàm hiện chart
 * @param {*} serial 
 */
 function Step3ShowChart(serial){
    if(myTempChart)myTempChart.destroy();
    console.log("Step3ShowChart",serial);
     showHideModal('modal_processing',true);
    getData(serial,(data)=>{
        const xValues = [];
        const temperature = [];
        const humidity = [];
        for(let i=0;i<data.length;i++){
            var date = new Date(data[i]["timestamp"]);
            xValues.push(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            temperature.push((data[i]["temperature"] || 0));
            humidity.push(data[i]["humidity"] );
        }
        myTempChart = new Chart("tempchart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                    data: temperature,
                    borderColor: "red",
                    fill: false,
                    label: "temperature"
                }, {
                    data: humidity,
                    borderColor: "blue",
                    fill: false,
                    label: "humidity"
                }]
            },
            options: {
                legend: { display: false },
                animation: {
                  onComplete: function() {
                      showHideModal('modal_processing',false);
                      }
                   }
            }
        });
    })
           



 }
 /** load danh sách serial */ 
 function getListSerial(callback){
    $.get(thisURL+"/listtable", (data, err) => {
        let arr = data.filter(x => x.name.startsWith("sensor_data_")).map(x=>x.name.replace("sensor_data_","")) ;
        callback(arr);
    });
 }
/**
 * Lấy danh sách n t
 * @param {*} serial 
 * @param {*} callback 
 */
 function getData(serial,callback){
    $.get(thisURL+"/data?machineserial="+serial, (data, err) => {
        callback(data);
    });
 }
