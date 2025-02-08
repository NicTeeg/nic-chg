import { Table } from "flowbite-react/components/Table";

const Chart = () => {
    return (
      <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.HeadCell>Version</Table.HeadCell>
          <Table.HeadCell>Commit SHA</Table.HeadCell>
          <Table.HeadCell>Commit Message</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              1.2.0
            </Table.Cell>
            <Table.Cell>
              <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                abc123
              </a>
            </Table.Cell>
            <Table.Cell>another change</Table.Cell>
            <Table.Cell>1/2/25</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              1.1.0
            </Table.Cell>
            <Table.Cell>
              <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                def345
              </a>
            </Table.Cell>
            <Table.Cell>some change</Table.Cell>
            <Table.Cell>15/1/25</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              1.0.0
            </Table.Cell>
            <Table.Cell>
              <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                bfe678
              </a>
            </Table.Cell>
            <Table.Cell>first change</Table.Cell>
            <Table.Cell>1/1/25</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
    );
  };
  
  export default Chart;