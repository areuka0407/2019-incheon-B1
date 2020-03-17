window.addEventListener("load", async () => {
    // 다이얼 로그 불러오기
    let dialog = {
        login: await fetch("/login.html")
                .then(v => v.text())
                .then(v => {
                    let dialog = $(v);
                    dialog.dialog({
                        autoOpen: false,
                        resizable: false,
                        width: 480
                    });
                    return dialog
                }),
        join: await fetch("/join.html")
                    .then(v => v.text())
                    .then(v => {
                        let dialog = $(v);
                        dialog.dialog({
                            autoOpen: false,
                            resizable: false,
                            width: 480
                        });
                        return dialog
                    }),
    }
    //  회원가입 다이얼로그 SUBMIT 이벤트
    dialog.join.find("form").on("submit", function(e){
        e.preventDefault();
        let error = false;

        let elem__id = $(this).find("#join__userid");
        if(elem__id.val().trim() === "") elem__id.prev().show();
        else elem__id.prev().hide();
    
        let elem__pw = $(this).find("#join__password");
        let regex__pw = /^(?=.*[a-zA-Z].*)(?=.*[0-9].*)(?=.*[!@#$%^&*\(\)].*)[a-zA-Z0-9!@#$%^&*\(\)]{6,20}$/;
        if(regex__pw.test(elem__pw.val())) elem__pw.prev().hide();
        else {
            elem__pw.prev().show();
            error = true;
        }

        let elem__name = $(this).find("#join__username");
        let regex__name = /^[ㄱ-ㅎㅏ-ㅣ가-힣]{2,4}$/;
        if(regex__name.test(elem__name.val())) elem__name.prev().hide();
        else {
            elem__name.prev().show();
            error = true;
        }
        
        let elem__phone = $(this).find("#join__phone");
        let regex__phone = /^[0-9]+$/;
        if(regex__phone.test(elem__phone.val())) elem__phone.prev().hide();
        else {
            elem__phone.prev().show();
            error = true;
        }

        if(error == false)
            this.submit();
    });

    // 회원가입 전화번호 이벤트
    dialog.join.find("#join__phone").on("input", function(e){
        let preview = dialog.join.find("#join__preview-phone");
        let input = this.value;

        if(input.length == 11) input = input.replace(/([0-9]{3})([0-9]{4})([0-9]{3})/, "$1-$2-$3")
        if(input.length == 10) input = input.replace(/([0-9]{3})([0-9]{3})([0-9]{3})/, "$1-$2-$3")
        if(input.length == 9)  input = input.replace(/([0-9]{2})([0-9]{3})([0-9]{3})/, "$1-$2-$3")
        
        preview.val(input);
    });
    

    // 다이얼 로그 생성 이벤트
    $("#link-login").on("click", e => {
        dialog.login.dialog("open");
    });

    $("#link-join").on("click", e => {
        dialog.join.dialog("open");
    });
});