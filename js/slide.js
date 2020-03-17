/**
 *  슬라이드
 *  1. 애니메이션 도중 연속해서 누르면 작동하지 않게 하기
 *  2. 한쪽 방향으로만 움직이는 슬라이드 
 *  2-1. 3번째 슬라이드 상태에서 1번 버튼을 누르면 '왼쪽'으로 이동해야함 (2번째 슬라이드가 보여선 안됨)
 *  2-2. 1번째 슬라이드 상태에서 3번 버튼을 누르면 '오른쪽'으로 이동해야함 (2번째 슬라이드가 보여선 안됨)
 *  3. requestAnimationFrame으로 설계
 */

window.addEventListener("load", e => {
    let current = 0;
    let slideTime = new Date().getTime();
    let images = Array.from(document.querySelectorAll("#visual .images div"));
    let circles = Array.from(document.querySelectorAll("#visual .circles span"));
    circles.forEach(circle => {
        circle.addEventListener("click", e => {
            let idx = parseInt(circle.dataset.idx);
            slideTime = new Date().getTime();
            slide(idx);
        });
    });

    document.querySelector("#prev-icon").addEventListener("click", e => {
        let idx = current - 1 < 0 ? circles.length - 1 : current - 1;
        slideTime = new Date().getTime();
        slide(idx, 1);
    });

    document.querySelector("#next-icon").addEventListener("click", e => {
        let idx = current + 1 >= circles.length ? 0 : current + 1;
        slideTime = new Date().getTime();
        slide(idx, -1);
    });

    function slide(idx, arrow = null){
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

    let frame = () => {
        let currentTime = new Date().getTime();
        if(currentTime - slideTime > 3000){
            slideTime = new Date().getTime();
            document.querySelector("#next-icon").click();
        }
        requestAnimationFrame(frame);
    };
    frame();
});