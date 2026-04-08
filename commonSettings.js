    const style = document.createElement('style');
    style.textContent = `
        .js-dateperiod label.active,
        .js-dateperiod-months label.active,
        .js-dateperiod .custom-range-btn.active {
            background: #666666 !important;
            border-color: #666666;
            color: #FFFFFF;
        }
    `;
    document.head.appendChild(style);

    const $ = window.jQuery;
    const momentLib = window.moment;

    // 안전한 DateTimePicker 주입
    function injectSafeDateTimePicker() {
        $('.js-dateperiod').each(function() {
            const $elements = $('input[name*="' + $(this).data('target-name') + '"]');
            if ($elements.length > 0) {
                const parent = $($elements[0]).parent();
                let picker = parent.data('DateTimePicker');
                if (!picker || typeof picker.format !== "function") {
                    parent.data('DateTimePicker', {
                        format: function() { return "YYYY-MM-DD"; }
                    });
                }
            }
        });
    }
    injectSafeDateTimePicker();
    const observerSafe = new MutationObserver(() => injectSafeDateTimePicker());
    observerSafe.observe(document.body, { childList: true, subtree: true });

    // 커스텀 버튼 생성 함수 (n년~(n-1)년)
    function createPastYearButton(n) {
        const wrapper = document.createElement('label');
        wrapper.className = "btn btn-white btn-sm hand custom-range-btn";

        const btn = document.createElement('input');
        btn.type = "radio";
        btn.name = "searchPeriod";

        const startDays = n * 365;
        const endDays = (n - 1) * 365;

        btn.value = startDays;
        btn.dataset.rangeStart = startDays;
        btn.dataset.rangeEnd = endDays;

        wrapper.appendChild(btn);
        wrapper.appendChild(document.createTextNode(`${n}년~${n-1}년`));

        return wrapper;
    }

    // 커스텀 버튼 생성 함수 (오늘~10년전)
    function createTodayToPastButton() {
        const wrapper = document.createElement('label');
        wrapper.className = "btn btn-white btn-sm hand custom-range-btn";

        const btn = document.createElement('input');
        btn.type = "radio";
        btn.name = "searchPeriod";

        const startDays = 10 * 365;
        const endDays = 0;

        btn.value = "9999";
        btn.dataset.rangeStart = startDays;
        btn.dataset.rangeEnd = endDays;

        wrapper.appendChild(btn);
        wrapper.appendChild(document.createTextNode("전체"));

        return wrapper;
    }

    // URL 파라미터 읽기
function getSearchPeriodFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("searchPeriod");
}

// 버튼 추가 후 active 처리
function addPastYearButtons(node) {
    const searchPeriod = getSearchPeriodFromUrl();

    for (let n = 2; n <= 5; n++) {
        const btnLabel = createPastYearButton(n);
        const input = btnLabel.querySelector('input[type="radio"]');

        node.appendChild(btnLabel);

        // URL 값과 매칭되면 active 처리
        if (searchPeriod && parseInt(searchPeriod, 10) === n * 365) {
            btnLabel.classList.add("active");
            input.checked = true;
        }
    }

    const todayBtnLabel = createTodayToPastButton();
    const input = todayBtnLabel.querySelector('input[type="radio"]');
    node.appendChild(todayBtnLabel);

    if (searchPeriod === "9999") {
        todayBtnLabel.classList.add("active");
        input.checked = true;
    }
}


    // 초기 DOM 검사 후 버튼 추가
    document.querySelectorAll('.js-dateperiod').forEach(node => {
        addPastYearButtons(node);
    });

    // MutationObserver로 동적 추가된 .js-dateperiod에도 버튼 삽입
    const observerBtn = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList.contains('js-dateperiod')) {
                    addPastYearButtons(node);
                }
            });
        });
    });
    observerBtn.observe(document.body, { childList: true, subtree: true });

    // 커스텀 버튼 클릭 이벤트 처리
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.custom-range-btn');
        if (!target) return;
        e.stopPropagation();

        const input = target.querySelector('input[type="radio"]');
        if (!input) return;

        const container = target.closest('.js-dateperiod');

        container.querySelectorAll('.custom-range-btn.active')
            .forEach(lbl => lbl.classList.remove('active'));

        target.classList.add('active');

        const startDays = parseInt(input.dataset.rangeStart, 10);
        const endDays = parseInt(input.dataset.rangeEnd, 10);
        const $elements = $('input[name*="' + container.dataset.targetName + '"]');

        let $format = "YYYY-MM-DD";
        try {
            const picker = $($elements[0]).parent().data('DateTimePicker');
            if (picker && typeof picker.format === "function") {
                $format = picker.format();
            }
        } catch (err) {
            console.warn("format 접근 실패, 기본 포맷 사용:", err);
        }

        const base = momentLib().hours(0).minutes(0).seconds(0);
        const startDate = base.clone().subtract(startDays, 'days').format($format);
        const endDate = base.clone().hours(23).minutes(59).seconds(0).subtract(endDays, 'days').format($format);

        $($elements[0]).val(startDate);
        $($elements[1]).val(endDate);
    });
