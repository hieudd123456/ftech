var socket = io();
socket.emit("data",{data:"hello world"});
socket.on("newimage",function(data){
    // cap nhat hinh
    $("#esp32img").attr("src","");
     $("#esp32img").attr("src",""+data.imagepath);
});
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
    let dates = new Date();
      let nameDate = ""+(""+dates.getDate()).padStart(2,"0")+"_"+(""+(dates.getMonth()+1)).padStart(2,"0")+"_"+dates.getFullYear();
      let fileName = `image_${nameDate}.jpg`;
	  fileName = `./images_esp32/${fileName}`;
      $("#esp32img").attr("src",fileName);
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
    getDatabyDate(serial,null,(data)=>{
        const xValues = [];
        const temperature = [];
        const humidity = [];
        let dataLength = data.length
        for(let i=0;i<data.length;i++){
            var date = new Date(data[i]["timestamp"].replace(" ","T")+"Z");
            xValues.push(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            temperature.push((data[i]["temperature"] || 0));
            humidity.push(data[i]["humidity"] );
              // tìm dòng cuối cùng.
            if(i == (dataLength -1) ){
                let tempstr = `<div class="text-warning" > ${data[dataLength-1]["temperature"]} °C </div>`;
                let humistr = `<div class="text-primary" > ${data[dataLength-1]["humidity"]} %rH</div>`;
                let timestr = `<div> ${date.toString()} </div>`;
                $("#div_last_status").empty();
                $("#div_last_status").append(tempstr);
                $("#div_last_status").append(humistr);
                $("#div_last_status").append(timestr);
            }
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
/* Lấy dữ liệu theo ngày*/
 function getDatabyDate(serial,fromDate=null,callback){
     let stringqueryDate="";
     if(fromDate!=null){
         stringqueryDate ="&fromdate="+fromDate ;
     }
    $.get(thisURL+"/datadate?machineserial="+serial+stringqueryDate, (data, err) => {
        callback(data);
    });
 }

