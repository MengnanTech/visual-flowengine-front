// import { ProTable, ProColumns } from '@ant-design/pro-table';
// import { Input, Select, Button } from 'antd';
//
// const { Option } = Select;
//
// interface WorkflowListItem {
//     key: number;
//     workflowName: string;
//     creator: string;
//     status: string;
// }
//
// const data: WorkflowListItem[] = [
//     // 示例数据
// ];
//
// const columns: ProColumns<WorkflowListItem>[] = [
//     {
//         title: 'Workflow Name',
//         dataIndex: 'workflowName',
//     },
//     {
//         title: 'Creator',
//         dataIndex: 'creator',
//     },
//     {
//         title: 'Status',
//         dataIndex: 'status',
//     },
// ];
//
// const CustomSearchTable: React.FC = () => {
//     return (
//         <ProTable<WorkflowListItem>
//             columns={columns}
//             dataSource={data}
//             rowKey="key"
//             search={{
//                 labelWidth: 100,
//                 span: 12,
//                 optionRender: ({searchText, resetText}, {form}, dom) => [
//                     <Button type="primary">check</Button>,
//                     <Button type="primary">Normal</Button>,
//                     <Button
//                         key="searchText"
//                         type="primary"
//                         onClick={() => {
//                             // console.log(params);
//                             form?.submit();
//                         }}
//                     >
//                         {searchText}
//                     </Button>,
//                     <Button
//                         key="resetText"
//                         onClick={() => {
//                             form?.resetFields();
//                         }}
//                     >
//                         {resetText}
//                     </Button>
//                 ]
//             }}
//
//         />
//     );
// };
//
// export default CustomSearchTable;
