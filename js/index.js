window.addEventListener("load", async () => {
    /**
     *  슬라이드
     *  1. 애니메이션 도중 연속해서 누르면 작동하지 않게 하기
     *  2. 한쪽 방향으로만 움직이는 슬라이드 
     *  2-1. 3번째 슬라이드 상태에서 1번 버튼을 누르면 '왼쪽'으로 이동해야함 (2번째 슬라이드가 보여선 안됨)
     *  2-2. 1번째 슬라이드 상태에서 3번 버튼을 누르면 '오른쪽'으로 이동해야함 (2번째 슬라이드가 보여선 안됨)
     *  3. requestAnimationFrame으로 시간에 맞춰서 슬라이드가 동작하도록 설계
     */

    let current = 0;
    let slideTime = new Date().getTime();
    let images = Array.from(document.querySelectorAll("#visual .images div"));
    let circles = Array.from(document.querySelectorAll("#visual .circles span"));
    circles.forEach(circle => {
        circle.addEventListener("click", e => {
            let idx = parseInt(circle.dataset.idx);
            slideTime = new Date().getTime();
            slideProcess(idx);
        });
    });

    document.querySelector("#prev-icon").addEventListener("click", e => {
        let idx = current - 1 < 0 ? circles.length - 1 : current - 1;
        slideTime = new Date().getTime();
        slideProcess(idx, 1);
    });

    document.querySelector("#next-icon").addEventListener("click", e => {
        let idx = current + 1 >= circles.length ? 0 : current + 1;
        slideTime = new Date().getTime();
        slideProcess(idx, -1);
    });

    function slideProcess(idx, arrow = null){
        let currentShow = images[current];
        let nextShow = images[idx];

        // 현재 슬라이드가 진행 중에 있거나, 목적지가 현재와 같다면 패스
        if(idx === current || currentShow.animated || nextShow.animated) 
        return false;

        circles.find(x => x.classList.contains("active")).classList.remove("active");
        circles[idx].classList.add("active");
        arrow = arrow ? arrow : idx > current ? -1 : 1;
    

        // 미리 이전 슬라이드를 진행방향 뒤로 이동 시켜둠
        nextShow.style.transition = "none";
        nextShow.style.transform = `translateX(${-arrow * 100}%)`;
        nextShow.style.zIndex = "0";

        // 스타일이 적용 되도록 큐에 올려두기만 함
        setTimeout(() => {
            currentShow.style.transition = "transform 0.5s";
            currentShow.style.transform = `translateX(${100 * arrow}%)`;
            currentShow.animated = setTimeout(() => {
                currentShow.animated = null;
            }, 500);

            current = idx;
            nextShow.style.zIndex = "1";
            nextShow.style.transition = "transform 0.5s";
            nextShow.style.transform = `translateX(0%)`;
            nextShow.animated = setTimeout(() => {
                nextShow.animated = null;
            }, 500);
        });
    }

    let frameOfSlide = () => {
        let currentTime = new Date().getTime();
        if(currentTime - slideTime > 3000){
            slideTime = new Date().getTime();
            document.querySelector("#next-icon").click();
        }
        requestAnimationFrame(frameOfSlide);
    };
    frameOfSlide();


    /**
     * 툴팁 띄우기 & 다이얼 로그 띄우기
     */
    // 다이얼 로그    
    let eventDialog = $("#dialog-event").dialog({
        autoOpen: false,
        sizable: false,
        width: 700
    });

    // 툴팁
    let toolTip = $(`<div class="tool-tip"></div>`)[0];
    let placements = await fetch("./data/placement.json").then(v => v.json());
    let events = await fetch("./data/reservation.json").then(v => v.json());
    document.querySelectorAll("#events .item").forEach(x => {
        let placeId = x.dataset.placement;
        let eventId = x.dataset.event;
        let placement = placements.find(p => p.id == placeId);
        let event = events.find(evt => evt.id == eventId);

        // 다이얼 로그
        x.addEventListener("click", e => {
            eventDialog.find(".event-name").text(event.name);
            eventDialog.find(".placement-name").text(placement.name);
            eventDialog.find(".score > img").attr("src", "./images/scores/" + placement.score + ".png");
            eventDialog.find(".score > span").text(placement.score + "점");
            eventDialog.find(".since").text(event.since);
            eventDialog.find(".until").text(event.until);

            eventDialog.dialog("open");
        });

        //툴팁
        x.addEventListener("mousemove", e => {
            let {clientX, clientY} = e;
            toolTip.style.left = clientX + "px";
            toolTip.style.top = clientY + "px";

            let dayList = "일 월 화 수 목 금 토".split(" ");
            toolTip.innerHTML = `<div class="wx-300 pl-2 pr-2 py-2">
                                    <p class="fx-n3 text-muted mb-1">행사장 정보</p>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <span class="text-black bold fx-2">${placement.name}</span>
                                        <div class="score d-flex align-items-center">
                                            <img src="./images/scores/${placement.score}.png" alt="${placement.score}" height="20">
                                            <span class="fx-n2 text-red ml-1">${placement.score}점</span>
                                        </div>
                                    </div>
                                    <p class="mt-2 text-muted fx-n2 d-flex flex-wrap">
                                        <span class="mr-2">${placement.rest.map(x => dayList[x]).join(", ")}요일 휴무</span>
                                    </p>
                                    <p class="text-gray fx-n1 mt-1">
                                        ${placement.description}
                                    </p>
                                </div>`;
            document.body.append(toolTip);
        });
        x.addEventListener("mouseleave", e => {
            toolTip.remove();
        });
    });
});