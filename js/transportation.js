let app;

class App {
    constructor(){
        this.init();
    }
    
    async init(){
        this.reserve__placements = await Ajax.getJSON("../data/reservation.json");
        this.reserve__transports = await Ajax.getJSON("../data/transportation_reservation.json");
        this.transports = await Ajax.getJSON("../data/transportation.json");
        this.tbody = document.querySelector("#reserve-transport .transport-table .tbody");


        // Dialog
        this.dialog = $("#dialog-reserve-transport");
        this.dialog.dialog({
            autoOpen:false,
            width: 600,
        });

        // Date Picker
        this.pickerOption = {
            prevText: "이전 달",
            nextText: "다음 달",
            monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            dayNames: ["일", "월", "화", "수", "목", "금", "토"],
            dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
            dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
            yearSuffix: "년",
            showMonthAfterYear:true,
            dateFormat: "yy-mm-dd",
            beforeShowDay: function(date){
                let dateStr = date.parseString();
                let overlap__events = !app.reserve__placements.some(x => {
                    let isOverlap = new Date(x.since) <= new Date(dateStr) && new Date(dateStr) <= new Date(x.until);
                    return isOverlap;
                });
                return [overlap__events];
            },
            onSelect: function(){
                let timeSelect = app.dialog.find("#reserve-time");
                let dateSelect = app.dialog.find("#reserve-date");

                if(!app.selected || ! dateSelect.val() || ! timeSelect.val()) return;

                let seatCnt = app.getLeaveSeat({id: app.selected, date: dateSelect.val(), time: timeSelect.val()});
                app.dialog.find(".limit").text(seatCnt);
            }
        };
        this.dialog.find("#reserve-date").datepicker(this.pickerOption);

        // spinner
        this.spinnerOption = {
            min: 0
        };
        this.dialog.find("#cnt-child").spinner(this.spinnerOption);
        this.dialog.find("#cnt-adult").spinner(this.spinnerOption);
        this.dialog.find("#cnt-old").spinner(this.spinnerOption);
        
        this.drawTable();
        this.setEvents();
    }

    drawTable(){
        this.tbody.innerHTML = "";
        this.transports.forEach(x => {
            let itemElem = this.getTitemHTML(x);
            this.tbody.append(itemElem);
        });
    }

    setEvents(){
        let timeSelect = this.dialog.find("#reserve-time");
        let dateSelect = this.dialog.find("#reserve-date");

        // 테이블 리스트 클릭
        $("body").on("click", ".titem", e => {
            this.selected = e.currentTarget.dataset.id;    

            let transport = this.transports.find(x => x.id == this.selected);
            this.dialog.find("#reserve-transport").val(`${transport.name}`);
            this.dialog.find("#reserve-date").datepicker("setDate", "");
            this.dialog.find(".limit").text('0');

            let [startTime, endTime] = transport.cycle;
            timeSelect.html("");
            
            for(let i = startTime.time2sec(); i < endTime.time2sec(); i += transport.interval){
                let optionElem = $(`<option vlaue="${i}">${i.sec2time()}</option>`)[0];
                timeSelect.append(optionElem);
            }

            this.dialog.find("#cnt-child").spinner("value", "0");
            this.dialog.find("#cnt-adult").spinner("value", "0");
            this.dialog.find("#cnt-old").spinner("value", "0");
            this.dialog.dialog("open");
        });

        // 일자 AND 시간 선택시 남은 좌석 수 보여주기
        let datetimeEvt = e => {
            if(!this.selected || ! dateSelect.val() || ! timeSelect.val()) return;

            let seatCnt = this.getLeaveSeat({id: this.selected, date: dateSelect.val(), time: timeSelect.val()});
            this.dialog.find(".limit").text(seatCnt);
        }
        timeSelect.on("input", datetimeEvt);

        console.log(dateSelect[0]);
        dateSelect[0].addEventListener("input", e => {
            console.log(e.target);
        });


        // 폼 전송 이벤트
        this.dialog.find("form").on("submit", e => {
            e.preventDefault();
            let child = this.dialog.find("#cnt-child");
            let adult = this.dialog.find("#cnt-adult");
            let old = this.dialog.find("#cnt-old");

            // 데이터 확인
            let isEmpty = child.spinner("value") + adult.spinner("value") + old.spinner("value") === 0
                            || !this.dialog.find("#reserve-date").val()
                            || !this.dialog.find("#reserve-time").val();
            if(isEmpty) return alert("입력 정보가 잘못되었습니다.");
            

            // 구매 가능 개수 확인
            let seatCnt = this.getLeaveSeat({id: this.selected, date: dateSelect.val(), time: timeSelect.val()});
            let buyCnt  = child.spinner("value")
                        + adult.spinner("value")
                        + old.spinner("value");
            if(seatCnt < buyCnt) return alert("인원이 너무 많습니다.");
            alert("결제가 진행되었습니다.");
        });

        // 인원 조절 시 총 가격 표시
        let spinners = $(this.dialog).find(".right input");
        spinners.on("spinstop", e => {
            let price = this.transports.find(x => x.id == this.selected).price;

            let child = this.dialog.find("#cnt-child").spinner("value") * price * 60 / 100;
            let adult = this.dialog.find("#cnt-adult").spinner("value") * price;
            let old = this.dialog.find("#cnt-old").spinner("value") * price * ( price  <= 20000 ? 0 : price <= 100000 ? 50 : 80) / 100;
            $(this.dialog).find(".total-price").text("￦ " + (child + adult + old).toLocaleString());
        });
    }


    getLeaveSeat({id, date, time}){
        let {limit} = this.transports.find(t => t.id == id);
        let reserveList = this.reserve__transports.filter(r => r.transportation == id && r.date == date && r.time == time);

        return reserveList.reduce((init, reserve) => {
            let buyCount = reserve.member.old + reserve.member.adult + reserve.member.kids;
            return init - buyCount;
        }, limit);
    }


    getTitemHTML(item){
        let dayList = "일월화수목금토".split("");
        let elem = $(`<div class="titem position-relative" data-id="${item.id}">
                        <label for="t-checkbox-${item.id}" class="position-absolute w-100 h-100 left-0 top-0"></label>
                        <div class="tdata checkbox">
                            <input type="radio" id="t-checkbox-${item.id}" name="reserve-id" hidden>
                            <label for="t-checkbox-${item.id}" class="custom-checkbox"></label>
                        </div>
                        <div class="tdata info">
                            <div class="w-100">
                                <span class="fx-1 bold text-black">${item.name}</span>
                                <p class="mt-1 fx-n1">${item.description}</p>
                            </div>
                        </div>
                        <div class="tdata price">￦ ${item.price.toLocaleString()}</div>
                        <div class="tdata rest">${item.rest.map(x => dayList[x]).join(", ")}</div>
                        <div class="tdata interval">${item.interval}분</div>
                        <div class="tdata cycle">${item.cycle.join(" ~ ")}</div>
                        <div class="tdata status">
                            <div class="success">운행중</div>
                        </div>
                    </div>`)[0];
        return elem;
    }
}

window.addEventListener("load", e => {
    app = new App();
});