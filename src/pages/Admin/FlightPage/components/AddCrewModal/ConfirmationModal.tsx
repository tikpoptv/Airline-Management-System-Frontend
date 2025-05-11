import React from 'react';
import { Modal, Table } from 'antd';
import { CrewMember } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  crewMember: CrewMember | null;
  roleInFlight: string;
}

const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  crewMember,
  roleInFlight,
}) => {
  const columns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  const data = [
    {
      key: '1',
      field: 'Crew Member',
      value: crewMember?.name || '-',
    },
    {
      key: '2',
      field: 'Current Role',
      value: crewMember?.role || '-',
    },
    {
      key: '3',
      field: 'Role in Flight',
      value: roleInFlight || '-',
    },
  ];

  return (
    <Modal
      title="Confirm Crew Assignment"
      open={isOpen}
      onCancel={onClose}
      onOk={onConfirm}
      okText="Confirm"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <p>Please confirm the following crew assignment:</p>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default ConfirmationModal; 