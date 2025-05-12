import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, message, Spin, Alert } from 'antd';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { flightService, AvailableCrew } from '../../../../../services/flight/flightService';
import styles from './AddCrewModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  flightId: number;
  onSuccess: () => void;
}

const ROLES_IN_FLIGHT = [
  { value: 'Pilot', label: 'Pilot' },
  { value: 'Co-Pilot', label: 'Co-Pilot' },
  { value: 'Attendant', label: 'Attendant' },
  { value: 'Technician', label: 'Technician' }
] as const;

const AddCrewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  flightId,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [crews, setCrews] = useState<AvailableCrew[]>([]);
  const [fetchingCrews, setFetchingCrews] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<AvailableCrew | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCrews = async () => {
        setFetchingCrews(true);
        console.log('Fetching crew data for flight ID:', flightId);
        
        try {
          // Use the service instead of direct fetch
          const crewList = await flightService.getAvailableCrews(flightId);
          console.log('Data received from API:', crewList);
          console.log('Number of crews found:', crewList.length);
          setCrews(crewList);
          
          if (crewList.length === 0) {
            message.info('No available crew found');
          }
        } catch (err) {
          console.error('Error fetching crew data:', err);
          setCrews([]);
          message.error({
            content: 'Failed to load crew data',
            duration: 5 // Display for 5 seconds
          });
          
          // Set timer to close modal after 5 seconds
          setTimeout(() => {
            onClose();
          }, 5000);
        } finally {
          setFetchingCrews(false);
        }
      };

      fetchCrews();
    } else {
      form.resetFields();
      setSelectedCrew(null);
      setCrews([]);
    }
  }, [isOpen, form, flightId, onClose]);

  const handleCrewSelect = (crewId: number) => {
    const crew = crews.find(c => c.crew_id === crewId);
    setSelectedCrew(crew || null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await flightService.assignCrewToFlight(flightId, values);
      message.success('Crew added successfully');
      onSuccess();
      onClose();
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to add crew');
      }
      console.error('Error assigning crew:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasCrews = crews.length > 0;

  return (
    <Modal
      title="Add Crew"
      open={isOpen}
      onCancel={onClose}
      okText="Add Crew"
      cancelText="Cancel"
      confirmLoading={loading}
      onOk={handleSubmit}
      width={600}
      maskClosable={false}
      destroyOnClose
      centered
    >
      <Spin spinning={fetchingCrews}>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="crew_id"
            label="Select Crew"
            rules={[{ required: true, message: 'Please select a crew member' }]}
          >
            <Select
              placeholder="Select crew member"
              showSearch
              optionFilterProp="children"
              disabled={fetchingCrews}
              onChange={handleCrewSelect}
              notFoundContent={fetchingCrews ? <Spin size="small" /> : 'No data found'}
            >
              {hasCrews && crews.map(crew => (
                <Select.Option 
                  key={crew.crew_id} 
                  value={crew.crew_id}
                  disabled={!crew.license_valid}
                >
                  {`${crew.name} - ${crew.role}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedCrew && (
            <div className={styles.crewInfo}>
              <div className={styles.crewInfoItem}>
                <span className={styles.crewInfoLabel}>Flight Hours:</span>
                <span className={styles.crewInfoValue}>{selectedCrew.flight_hours.toFixed(0)} hours</span>
              </div>
              <div className={styles.crewInfoItem}>
                <span className={styles.crewInfoLabel}>Status:</span>
                <span className={styles.crewInfoValue}>{selectedCrew.status}</span>
              </div>
              {!selectedCrew.license_valid && (
                <Alert
                  message="License Expired"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  className={styles.roleWarning}
                />
              )}
            </div>
          )}

          <Form.Item
            name="role_in_flight"
            label="Role in Flight"
            rules={[{ required: true, message: 'Please select a role' }]}
            tooltip={{ 
              title: 'Select the role to assign for this flight',
              icon: <InfoCircleOutlined />
            }}
          >
            <Select placeholder="Select role">
              {ROLES_IN_FLIGHT.map(role => (
                <Select.Option key={role.value} value={role.value}>
                  {role.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddCrewModal; 