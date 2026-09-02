    /* global jQuery, $ */

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

    // 클릭 이벤트 처리
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


    // 결제 실패, 결제 중단, 환불 등 숨기기 버튼
    (function($) {
        let currentOrderId = '';
        let targetOrders = new Set();

        // 필터링할 타겟 상태값들 (여기에 원하는 상태를 계속 추가할 수 있습니다)
        const targetStatuses = ['결제실패', '고객결제중단', '환불완료', '환불접수'];

        $('.table-rows tbody tr').each(function() {
            let $tds = $(this).children('td');

            if ($tds.length >= 10) {
                currentOrderId = $tds.eq(2).text().trim();
            }
            $(this).attr('data-order-id', currentOrderId);

            let statusIndex = ($tds.length >= 10) ? 8 : 5;
            let statusText = $tds.eq(statusIndex).text().trim();

            // 상태값 중 하나라도 포함되어 있는지 확인
            let isTarget = targetStatuses.some(status => statusText.indexOf(status) !== -1);
            if (isTarget) {
                targetOrders.add(currentOrderId);
            }
        });

        if ($('#custom-status-filter').length === 0) {
            let filterHtml = `
            <div id="custom-status-filter" style="margin-bottom: 15px; padding: 10px 15px; background: #fff2f2; border: 1px solid #ffcaca; border-radius: 4px; display: inline-block;">
                <strong style="color:#d9534f; margin-right: 10px;">취소/환불 내역 필터:</strong>
                <button type="button" id="btn-show-all" class="btn btn-sm btn-white">전체 보기</button>
                <button type="button" id="btn-show-target" class="btn btn-sm" style="background:#d9534f; color:#fff; border:none;">해당 내역만 보기</button>
                <button type="button" id="btn-hide-target" class="btn btn-sm" style="background:#f0ad4e; color:#fff; border:none;">해당 내역 숨기기</button>
            </div>`;
            $('.table-rows').before(filterHtml);
        }

        function toggleRows(mode) {
            $('.table-rows tbody tr').each(function() {
                let orderId = $(this).attr('data-order-id');
                let isTargetOrder = targetOrders.has(orderId);

                if (mode === 'all') {
                    $(this).show();
                } else if (mode === 'only-target') {
                    isTargetOrder ? $(this).show() : $(this).hide();
                } else if (mode === 'hide-target') {
                    isTargetOrder ? $(this).hide() : $(this).show();
                }
            });
        }

        $('#btn-show-all').on('click', function() { toggleRows('all'); });
        $('#btn-show-target').on('click', function() { toggleRows('only-target'); });
        $('#btn-hide-target').on('click', function() { toggleRows('hide-target'); });

    })(jQuery);
