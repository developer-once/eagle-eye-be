import react, { useEffect, useState } from 'react';
import moment from 'moment';
import Chart from '@baishan/chart-line';
import { EChartsOption } from 'echarts/types/dist/echarts';
import { useParams } from "react-router-dom";
import { DatePicker, Form, Modal } from 'antd';
import {
  SettingOutlined
} from '@ant-design/icons';

import Table from '../../component/Table';
import {
  lineOption,
  performance,
  crashConfig,
  barConfig,
} from '../../utils/chart';
import {
  getDashboard,
  getProject,
  getErrorList,
  getPerformanceDashboard,
  getCrashDashboard,
  getPageGroupPv,
  getGroupPerformanceApi,
  getGroupPerformanceRes
} from '../../services/api';

import './index.css';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const dayFormat = 'YYYY-MM-DD';


const Home: React.FC = (props: any) => {
  const params: any = useParams();
  const [ startTime, setStartTime ] = useState(moment().subtract(6, 'days').format(dateFormat));
  const [ endTime, setEndTime ] = useState(moment(new Date()).format(dateFormat));
  const [ userChoose, setUserChoose ] = useState("");
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ project, setProject ] = useState({ name: "" });
  const [ tableList, setTableList ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ total, setTotal ] = useState(1);
  // ---- PV 、UV ----
  const [ chartLineOption, setChartLineOption ] = useState<EChartsOption>(lineOption);
  // ---- Page Top 10 ----
  const [ barOption, setBarOption ] = useState<EChartsOption>(barConfig);
  // ---- Performance ----
  const [ performanceOption, setPerformanceOption ] = useState<EChartsOption>(performance);

  // ---- 接口聚合 慢API Top 10 ---
  const [ groupApiPerformanceOption, setGroupApiGPerformanceOption ] = useState<EChartsOption>(barConfig);

  // ---- 接口聚合 慢API Top 10 ---
  const [ groupResPerformanceOption, setGroupResGPerformanceOption ] = useState<EChartsOption>(barConfig);

  // ---- crashOption ----
  const [ crashOption, setCrashOption ] = useState<EChartsOption>(crashConfig);

  // --- 获取项目 ID ---
  useEffect(() => {
    setUserChoose(params.id);
  }, []);

  // --- 获取项目详情 ---
  useEffect(() => {
    if (!userChoose) { return }
    getProject({
      app_key: userChoose
    }).then((res) => {
      setProject(res);
    })
  }, [userChoose])

  // ---------- 站点 PV/UV ----------
  useEffect(() => {
    if (!userChoose) { return }
    getDashboard({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {
      setChartLineOption({
        ...chartLineOption,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: res?.date,
        },
        series: [
          {
            name: 'PV',
            type: 'line',
            data: res?.pv,
            smooth: true,
          },
          {
            name: 'UV',
            type: 'line',
            data: res?.uv,
            smooth: true,
          }
        ]
      });
    })
  }, [userChoose, startTime, endTime]);



  // ---------- 页面 PV Top 10 ----------
  useEffect(() => {
    if (!userChoose) { return }
    getPageGroupPv({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {
      let urlArray: any = [];
      let numArray: any = [];
      res?.map((item: any) =>  {
        urlArray.push(item.url);
        numArray.push(item.num);
      })
      setBarOption({
        ...barOption,
        xAxis: {
          type: 'category',
          data: urlArray,
          axisLabel: {
            interval: 0,
            formatter: function (params: any) {
              var newParamsName = ''
              const paramsNameNumber = params.length
              const provideNumber = 20 // 单行显示文字个数
              const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
              if (paramsNameNumber > provideNumber) {
                for (let p = 0; p < rowNumber; p++) {
                  var tempStr = ''
                  var start = p * provideNumber
                  var end = start + provideNumber
                  if (p === rowNumber - 1) {
                    tempStr = params.substring(start, paramsNameNumber)
                  } else {
                    tempStr = params.substring(start, end) + '\n'
                  }
                  newParamsName += tempStr
                }
              } else {
                newParamsName = params
              }
              return newParamsName
            }
          }
        },
        series: [
          {
            data: numArray,
            type: 'bar',
            barWidth : 40,
          }
        ]
      })
    });
  }, [userChoose, startTime, endTime]);

  // ---------- 错误列表 ----------
  useEffect(() => {
    if (!userChoose) { return }
    getErrorList({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
      currentPage: page
    }).then((res) => {
      setTableList(res?.rows);
      setTotal(res?.count);
    })
  }, [userChoose, startTime, endTime, page]);

  // ---------- 整站慢请求 ---------- 
  useEffect(() => {
    if (!userChoose) { return }
    getPerformanceDashboard({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {
      setPerformanceOption({
        ...performanceOption,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: res.date,
        },
        series: [
          {
            name: '慢资源',
            type: 'line',
            data: res?.res,
            smooth: true,
          },
          {
            name: '慢请求',
            type: 'line',
            data: res?.api,
            smooth: true,
          },
        ]
      });
    });
  }, [userChoose, startTime, endTime]);

  // ---------- 接口聚合 慢请求 ----------
  useEffect(() => {
    if (!userChoose) { return }
    getGroupPerformanceApi({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {

      let urlArray: any = [];
      let numArray: any = [];
      res?.map((item: any) =>  {
        urlArray.push(item.url);
        numArray.push(item.num);
      })

      console.log(1111111111, urlArray, numArray);

      setGroupApiGPerformanceOption({
        ...barOption,
        xAxis: {
          type: 'category',
          data: urlArray,
          axisLabel: {
            interval: 0,
            formatter: function (params: any) {
              var newParamsName = ''
              const paramsNameNumber = params.length
              const provideNumber = 20 // 单行显示文字个数
              const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
              if (paramsNameNumber > provideNumber) {
                for (let p = 0; p < rowNumber; p++) {
                  var tempStr = ''
                  var start = p * provideNumber
                  var end = start + provideNumber
                  if (p === rowNumber - 1) {
                    tempStr = params.substring(start, paramsNameNumber)
                  } else {
                    tempStr = params.substring(start, end) + '\n'
                  }
                  newParamsName += tempStr
                }
              } else {
                newParamsName = params
              }
              return newParamsName
            }
          }
        },
        series: [
          {
            data: numArray,
            type: 'bar',
            barWidth : 40,
          }
        ]
      })
    })
  }, [userChoose, startTime, endTime]);

  // ---------- 接口聚合 慢资源 ----------
  useEffect(() => {
    if (!userChoose) { return }
    getGroupPerformanceRes({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {

      let urlArray: any = [];
      let numArray: any = [];
      res?.map((item: any) =>  {
        urlArray.push(item.url);
        numArray.push(item.num);
      })

      setGroupResGPerformanceOption({
        ...barOption,
        xAxis: {
          type: 'category',
          data: urlArray,
          axisLabel: {
            interval: 0,
            formatter: function (params: any) {
              var newParamsName = ''
              const paramsNameNumber = params.length
              const provideNumber = 20 // 单行显示文字个数
              const rowNumber = Math.ceil(paramsNameNumber / provideNumber)
              if (paramsNameNumber > provideNumber) {
                for (let p = 0; p < rowNumber; p++) {
                  var tempStr = ''
                  var start = p * provideNumber
                  var end = start + provideNumber
                  if (p === rowNumber - 1) {
                    tempStr = params.substring(start, paramsNameNumber)
                  } else {
                    tempStr = params.substring(start, end) + '\n'
                  }
                  newParamsName += tempStr
                }
              } else {
                newParamsName = params
              }
              return newParamsName
            }
          }
        },
        series: [
          {
            data: numArray,
            type: 'bar',
            barWidth : 40,
          }
        ]
      })
    })
  }, [userChoose, startTime, endTime]);

  // ---------- getCrashDashboard ----------
  useEffect(() => {
    if (!userChoose) { return }
    getCrashDashboard({
      app_key: userChoose,
      startTime: startTime,
      endTime: endTime,
    }).then((res: any) => {
      setCrashOption({
        ...crashConfig,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: res.date,
          smooth: true,
        },
        series: [
          {
            name: 'Crash',
            type: 'line',
            data: res?.res,
            smooth: true,
          },
        ]
      });
    });
  }, [userChoose, startTime, endTime]);

  // ----- onChangeDate -----
  const onChangeDate = (date: any, value: any) => {
    setStartTime(moment(value[0]).format(dateFormat));
    setEndTime(moment(value[1]).format(dateFormat));
  };

  const onChange = (value: number) => {
    setPage(value);
  }

  // --- 回放 ---
  const replayRrweb = (data: string) => {
    setIsModalVisible(true);
    setTimeout(() => {
      try {
        // @ts-ignore
        var array = JSON.parse(data);
        // @ts-ignore
        new rrwebPlayer({
          target: document.getElementById("rrweb-replay"),
          props: { events: array },
        });
      } catch (err: any) {}
    }, 300);
  }

  // --- 关闭弹窗 ---
  const onClickModal = () => {
    try {
      var box = document.getElementsByClassName("rr-player")[0];
      box.remove();
    } catch (err: any) {}
    setTimeout(() => {
      setIsModalVisible(!isModalVisible);
    }, 100);
  }

  const columns = [
    // {
    //   title: '应用',
    //   dataIndex: 'app_key',
    //   key: 'app_key',
    // },
    {
      title: '类型',
      dataIndex: 'event_type',
      key: 'event_type',
    },
    {
      title: '来源',
      dataIndex: 'referrer',
      key: 'referrer',
    },
    {
      title: '详细描述',
      dataIndex: 'error_msg_message',
      key: 'error_msg_message',
    },
    {
      title: '错误栈',
      dataIndex: 'error_stack',
      key: 'error_stack',
    },
    {
      title: '上报时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: any, record: any) => (
        <>
          {moment(record.createdAt).format(dateFormat)}
        </>
      )
    },
    {
      title: '操作',
      render: (text: any, record: any) => (
        <>
          <a onClick={() => {
            replayRrweb(record.record)
          }}>
            {record.record && record.record?.length > 2 ? "错误回放" : ""}
          </a>
        </>
      )
    },
  ];

  return (
    <div className="home">
      {/* ----- 查询数据 ----- */}
      <div className="block">
        <div className='flex-box'>
          <div className="title">{project.name}</div>
          <SettingOutlined style={{fontSize: "20px"}} onClick={() => {
            window.location.href = `/setting/${params.id}`;
          }}/>
        </div>
        <div className="form">
          <Form>
            <Form.Item name="date" label="选择时间范围：" rules={[{ required: true }]}>
              <RangePicker defaultValue={
              [
                moment(startTime),
                moment(endTime),
              ]
            } format={dayFormat} onChange={onChangeDate}/>
            </Form.Item>
          </Form>
        </div>
      </div>
      {/* ----- PV/UV ----- */}
      <div className="block"> 
        <div className='title'>站点 PV/UV </div>
        <Chart
          id="chart-line-pv"
          // width={500}
          style={{
            display: 'block',
            height: '300px',
            margin: '0 auto',
          }}
          option={chartLineOption}
        />
      </div>

      {/* ----- 页面聚合 PV -----  */}
      <div className="block"> 
        <div className='title'>页面 PV（TOP 10） </div>
        <Chart
          id="chart-bar-pv"
          height={500}
          style={{
            display: 'block',
            height: '500px',
            margin: '0 auto',
          }}
          option={barOption}
        />
      </div>

      {/* ----- JS报错 ----- */}
      <div className="block">
        <div className='title'>JS报错</div>
        <Table
          key={"home"}
          columns={columns}
          dataSource={tableList}
          page={page}
          total={total}
          onChange={onChange}
        ></Table>
      </div>

      {/* ----- 慢资源加载 ----- */}
      <div className="block">
        <div className='title'>慢资源加载（{'>'} 400ms）</div>
        <Chart
          id="chart-line-performance"
          style={{
            display: 'block',
            height: '300px',
            margin: '0 auto',
          }}
          option={performanceOption}
        />
      </div>

      {/* ----- 页面聚合 慢资源加载 -----  */}
      <div className="block"> 
        <div className='title'>页面 慢API（TOP 10） </div>
        <Chart
          id="chart-bar-performance-api"
          // width={500}
          height={500}
          style={{
            display: 'block',
            height: '500px',
            margin: '0 auto',
          }}
          option={groupApiPerformanceOption}
        />
      </div>

      {/* ----- 页面聚合 慢资源加载 -----  */}
      <div className="block"> 
        <div className='title'>页面 慢资源（TOP 10） </div>
        <Chart
          id="chart-bar-performance-res"
          // width={500}
          height={500}
          style={{
            display: 'block',
            height: '500px',
            margin: '0 auto',
          }}
          option={groupResPerformanceOption}
        />
      </div>

      {/* ----- 页面 Crash ----- */}
      <div className="block">
        <div className='title'>页面 Crash</div>
        <Chart
          id="chart-line-crash"
          // width={500}
          style={{
            display: 'block',
            height: '300px',
            margin: '0 auto',
          }}
          option={crashOption}
        />
      </div>
      
      {/* ----- 全国流量分布 ----- */}
      {/* <div className="block">
        <Row>
          <Col span={12}>
            <Chart
              id="chart-line-map"
              // width={600}
              style={{
                display: 'block',
                height: '300px',
                margin: '0 auto',
              }}
              option={chartLineOption}
            />
          </Col>
          <Col span={12}>
            <Chart
              id="chart-line-line"
              // width={600}
              style={{
                display: 'block',
                height: '300px',
                margin: '0 auto',
              }}
              option={chartLineOption}
            />
          </Col>
        </Row>
      </div> */}


      {/* ------ Modal ------ */}
      <Modal
        title="错误回放"
        visible={isModalVisible}
        onOk={onClickModal}
        onCancel={onClickModal}
        width={1200}
        style={
          {
            width: "1200px",
            height: "800px"
          }
        }
      >
        <div
          id="rrweb-replay"
          style={
            {
              width: "1200px",
              height: "800px"
            }
          }
        ></div>
      </Modal>
    </div>
  )
}

export default Home
