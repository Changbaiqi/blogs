window.onload = (function () {
    const MCO = {
        '1': '#EA5455', //100>=money
        '2': '#b294db', // 100>money>=50
        '3': '#FDD819', // 50>money>=30
        '4': '#0396FF', // 30>money>=10
        '5': '#28C76F', // 10>money>=5
        '6': '#000000', // 5>mone>=3
        '7': '#363636' // money<3
    };
    const data = [
        { name: '我是张*锐', color: MCO['1'], money: '200.00', date: '2024/01/10' },
        { name: '我是张*锐', color: MCO['1'], money: '400.00', date: '2023/12/01' },
        { name: '*闻', color: MCO['1'], money: '100.00', date: '2025/04/25' },
        { name: '我是张*锐', color: MCO['1'], money: '100.00', date: '2024/05/01' },
        { name: '我是张*锐', color: MCO['1'], money: '100.00', date: '2023/11/28' },
        { name: '我是张*锐', color: MCO['1'], money: '100.00', date: '2023/11/27' },
        { name: '我是张*锐', color: MCO['1'], money: '100.00', date: '2023/11/14' },
        { name: '我是张*锐', color: MCO['1'], money: '100.00', date: '2023/11/01' },
        { name: '*遥', color: MCO['2'], money: '58.88', date: '2025/04/27' },
        { name: 'Venator', color: MCO['2'], money: '52.00', date: '2024/09/11' },
        { name: '*🐵', color: MCO['3'], money: '35.00', date: '2023/11/20' },
        { name: '我是当地皮鞋', color: MCO['3'], money: '30.00', date: '2025/06/05' },
        { name: '加载中······', color: MCO['4'], money: '20.00', date: '2024/10/08' },
        { name: '*雨', color: MCO['4'], money: '20.00', date: '2024/09/11' },
        { name: '一*c', color: MCO['4'], money: '20.00', date: '2024/05/11' },
        { name: '*迁', color: MCO['4'], money: '20.00', date: '2023/11/07' },
        { name: '*遥', color: MCO['4'], money: '18.88', date: '2023/11/29' },
        { name: '鸡你太美', color: MCO['4'], money: '16.88', date: '2025/02/18' },
        { name: '***焕', color: MCO['4'], money: '16.66', date: '2024/09/11' },
        { name: 'Yong', color: MCO['4'], money: '15.00', date: '2025/04/24' },
        { name: '清心寡欲', color: MCO['4'], money: '12.00', date: '2024/05/08' },
        { name: '2*9', color: MCO['4'], money: '10.00', date: '2025/06/18' },
        { name: '*水', color: MCO['4'], money: '10.00', date: '2025/05/20' },
        { name: '大佬，我没啥钱，谢谢大佬', color: MCO['4'], money: '10.00', date: '2025/03/18' },
        { name: '090', color: MCO['4'], money: '10.00', date: '2024/12/01' },
        { name: '**霖', color: MCO['4'], money: '10.00', date: '2024/09/13' },
        { name: 'by 江风易天', color: MCO['4'], money: '10.00', date: '2024/09/12' },
        { name: '云深不知处', color: MCO['4'], money: '10.00', date: '2024/01/27' },
        { name: '*ཀ', color: MCO['4'], money: '10.00', date: '2023/11/22' },
        { name: 'TT', color: MCO['5'], money: '6.66', date: '2024/09/11' },
        { name: 'J*u', color: MCO['5'], money: '6.66', date: '2024/09/11' },
        { name: '*许', color: MCO['5'], money: '6.60', date: '2023/12/14' },
        { name: 'cr迷宫吱吱鼠', color: MCO['5'], money: '5.00', date: '2024/11/03' },
        { name: '*呢', color: MCO['5'], money: '5.00', date: '2024/09/19' },
        { name: '**霖', color: MCO['5'], money: '5.00', date: '2024/09/11' },
        { name: '行风行里', color: MCO['5'], money: '5.00', date: '2024/05/09' },
        { name: '鹤川', color: MCO['6'], money: '3.00', date: '2024/12/11' },
        { name: '好先生', color: MCO['6'], money: '3.00', date: '2024/04/14' },
        { name: '*诀', color: MCO['7'], money: '2.00', date: '2025/06/02' },
        { name: '*霸', color: MCO['7'], money: '1.00', date: '2025/05/03' },
        { name: '**玮', color: MCO['7'], money: '1.00', date: '2024/09/11' },
        { name: '云深不知处', color: MCO['7'], money: '0.01', date: '2024/01/27' },
        { name: '**杰', color: MCO['7'], money: '0.01', date: '2024/01/27' }
    ];

    const rewardDom = document.getElementById('reward');
    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += `<div class="reward-item-content">
        <div class="reward-item-name">${data[i].name}</div>
        <div class="reward-item-time">
            <div class="reward-item-money" style="background-color: ${data[i].color};">￥${data[i].money}</div>
            <div>${data[i].date}</div>
        </div>
        </div>`;
    };

    rewardDom.innerHTML = html;
})();