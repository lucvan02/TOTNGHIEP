import { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, DatePicker, Statistic, Space, Table, Tag, message } from "antd";
import { Line, Column, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import { statsApi } from "../../api/adminStatsApi";

const { RangePicker } = DatePicker;

const money = (n) => (n ?? 0).toLocaleString() + "₫";

export default function Statistics() {
  const [range, setRange] = useState([dayjs().startOf("month"), dayjs()]);
  const [loading, setLoading] = useState(false);

  const [kpi, setKpi] = useState(null);
  const [rev, setRev] = useState([]);
  const [ord, setOrd] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [pmDist, setPmDist] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  const from = range?.[0]?.format("YYYY-MM-DD");
  const to = range?.[1]?.format("YYYY-MM-DD");

  const load = async () => {
    try {
      setLoading(true);
      const [k, r, o, s, pm, tb] = await Promise.all([
        statsApi.kpis(from, to),
        statsApi.revenueDaily(from, to),
        statsApi.ordersDaily(from, to),
        statsApi.orderStatus(from, to),
        statsApi.paymentMethods(from, to),
        statsApi.topBooks(from, to, 10),
      ]);
      setKpi(k.data.data);
      setRev((r.data.data || []).map(x => ({ date: x.date, value: x.value })));
      setOrd((o.data.data || []).map(x => ({ date: x.date, value: x.value })));
      setStatusDist((s.data.data || []).map(x => ({ type: x.name, value: x.value })));
      setPmDist((pm.data.data || []).map(x => ({ type: x.name, value: x.value })));
      setTopBooks(tb.data.data || []);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Không tải được thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to]);

  const aov = useMemo(() => kpi ? kpi.aov : 0, [kpi]);
  const conversionPct = useMemo(() => kpi ? Math.round((kpi.conversion || 0) * 1000)/10 : 0, [kpi]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>📈 Thống kê tổng quan</h2>
          <RangePicker
            value={range}
            onChange={setRange}
            allowClear={false}
            format="YYYY-MM-DD"
          />
        </Space>
      </Card>

      {/* KPIs */}
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Số sản phẩm" value={4} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Số lượng đơn hàng" value={kpi?.totalOrders || 0} />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Đơn hoàn thành" value={kpi?.completedOrders || 0} />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Doanh thu" value={money(kpi?.revenue || 0)} />
          </Card>
        </Col>


        {/* <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="AOV (giá trị TB/đơn)" value={money(aov)} />
          </Card>
        </Col> */}
        {/* <Col xs={24} md={6}>
          <Card loading={loading}>
            <Statistic title="Tỉ lệ thanh toán" value={`${conversionPct}%`} />
          </Card>
        </Col> */}
      </Row>

      {/* Charts */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo ngày" loading={loading}>
            <Column
              data={rev}
              xField="date"
              yField="value"
              tooltip={{ formatter: (d) => ({ name: "Doanh thu", value: money(d.value) }) }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Số đơn theo ngày" loading={loading}>
            <Line
              data={ord}
              xField="date"
              yField="value"
              smooth
              tooltip={{ formatter: (d) => ({ name: "Đơn hàng", value: d.value }) }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* <Col xs={24} lg={12}>
          <Card title="Phân bố trạng thái đơn" loading={loading}>
            <Pie
              data={statusDist}
              angleField="value"
              colorField="type"
              label={{ type: "outer", content: "{name} {percentage}" }}
              legend={{ position: "bottom" }}
            />
          </Card>
        </Col> */}
        {/* <Col xs={24} lg={12}>
          <Card title="Phương thức thanh toán" loading={loading}>
            <Pie
              data={pmDist}
              angleField="value"
              colorField="type"
              label={{ type: "outer", content: "{name} {percentage}" }}
              legend={{ position: "bottom" }}
            />
          </Card>
        </Col> */}
      </Row>

      {/* Top books */}
      <Card title="Top sách bán chạy" loading={loading}>
        <Table
          rowKey={(r) => r.bookId}
          dataSource={topBooks}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "#",
              render: (_, __, idx) => idx + 1,
              width: 60,
            },
            {
              title: "Sách",
              render: (r) => (
                <Space>
                  {r.image ? <img src={r.image} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 4 }} /> : null}
                  <span>{r.title}</span>
                </Space>
              ),
            },
            { title: "Đã bán", dataIndex: "qty", width: 120 },
            // {
            //   title: "Doanh thu",
            //   dataIndex: "revenue",
            //   width: 160,
            //   render: (v) => money(v),
            //   sorter: (a, b) => a.revenue - b.revenue
            // },
          ]}
        />
      </Card>
    </Space>
  );
}
