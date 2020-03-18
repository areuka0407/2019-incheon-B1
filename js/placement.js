let app;

class App {
    get startDate(){
        return this.dialog.find("#start-date").val();
    }
    get endDate(){
        return this.dialog.find("#end-date").val();
    }

    constructor(){
        this.init();
    }

    async init(){
        this.placements = await this.getPlacements();
        this.reservations = await this.getReservation();

        this.placeId = null;

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
                if(app.placeId === null) return [false];

                let placement = app.placements.find(place => place.id == app.placeId);
                let hasEvents = app.reservations.filter(evt => evt.placement == app.placeId);
    
                let overlap__events = !hasEvents.reduce((prev, current) => {
                    let isOverlap = new Date(current.since) <= date && date <= new Date(current.until);
                    return prev || isOverlap;
                }, false)
                
                let overlap__rest = !placement.rest.includes( date.getDay() );

                
                let overlap__startDate = app.startDate.trim() !== "" && this.id !== "start-date" ? date > new Date(app.startDate) : true;
                let overlap__endDate = app.endDate.trim() !== "" && this.id !== "end-date" ? date < new Date(app.endDate) : true;
                
    
                return [overlap__events && overlap__rest && overlap__startDate && overlap__endDate];
            },
        };


        this.dialog = $("#dialog-reservation");
        this.dialog.dialog({
            autoOpen: false,
            resizable: false,
            width: 500,
            close: function(){
                $(this).find("#start-date").val('');
                $(this).find("#end-date").val('');
            }
        });

        this.setPlacement();
        this.setEvent();
    }

    setPlacement(){
        let dayList = "일월화수목금토".split("");

        let contains = document.querySelector("#reserve-placement .list");
        contains.innerHTML = '';
        this.placements.forEach(place => {
            let item = $(`<div class="item item-33 item-sm-100 hover-opacity-reverse pointer" data-id="${place.id}">
                            <div class="w-100 hx-250">
                                <img class="image-cover" src="./images/placement/${place.image[0]}" alt="행사장 이미지">
                            </div>
                            <div class="pl-2 pr-2 py-2">
                                <div class="d-flex align-items-center justify-content-between">
                                    <span class="text-black bold fx-2">${place.name}</span>
                                    <div class="score d-flex align-items-center">
                                        <img src="./images/scores/${place.score}.png" alt="${place.score}" height="20">
                                        <span class="fx-n2 text-red ml-1">${place.score}점</span>
                                    </div>
                                </div>
                                <p class="mt-2 text-muted fx-n2 d-flex flex-wrap">
                                    <span class="mr-2">임대료(1일): ${place.price.toLocaleString()} 만원</span>
                                    <span class="mr-2">${place.rest.map(d => dayList[d]).join(", ")}요일 휴무</span>
                                </p>
                                <p class="text-gray fx-n1 mt-1">
                                    ${place.description}
                                </p>
                            </div>
                        </div>`)[0];
            contains.append(item);
        });
    }

    setEvent(){
        this.dialog.find("form").on("submit", function(e){
            e.preventDefault();

            if(this.querySelector("#event-image").files.length === 0){
                alert("행사 이미지를 업로드해 주세요!");
                return;
            }

            e.target.submit();
        });

        $("#reserve-placement .list").on("click", ".item", async e => {
            let target = e.currentTarget || e.target;
            this.placeId = parseInt(target.dataset.id);

            
            let startDate = this.dialog.find("#start-date");
            let endDate = this.dialog.find("#end-date");
            startDate.datepicker(this.pickerOption);
            endDate.datepicker(this.pickerOption);

            startDate.on("input", e => {
                console.log(e.target.value);
            });
            endDate.on("input", e => {
                console.log(e.target.value);
            });
        
            this.dialog.dialog("open");
        });
    }

    // ajax

    getPlacements(){
        return new Promise(res => {
            fetch("../data/placement.json")
            .then(v => v.json())
            .then(v => res(v));
        });
    }
    
    getReservation(){
        return new Promise(res => {
            fetch("../data/reservation.json")
            .then(v => v.json())
            .then(v => res(v));
        });
    }
}

window.addEventListener("load", e => {
    app = new App();
});