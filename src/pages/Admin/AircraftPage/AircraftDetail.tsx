import { useState, useEffect } from 'react';
import { Aircraft } from '../../../types/aircraft';
import { Flight } from '../../../types/flight';
import AircraftProfileSection from './AircraftProfileSection';
import FlightSchedule from './FlightSchedule';
import './AircraftDetails.css';

interface Props {
    aircraft: Aircraft;
    flightList: Flight[];
    loading: boolean;
    sortOption: 'date' | 'status';
    setSortOption: (v: 'date' | 'status') => void;
    flightFilter: 'all' | 'today';
    setFlightFilter: (v: 'all' | 'today') => void;
    onBack: () => void;
    isEditMode: boolean;
}

const AircraftDetail = ({
    aircraft,
    flightList,
    loading,
    sortOption,
    setSortOption,
    flightFilter,
    setFlightFilter,
    onBack,
    isEditMode,
}: Props) => {
    const [editData, setEditData] = useState<Aircraft>(aircraft);
    const [originalData, setOriginalData] = useState<Aircraft>(aircraft);

    useEffect(() => {
        setEditData(aircraft);
        setOriginalData(aircraft);
    }, [aircraft]);

    const handleChange = <K extends keyof Aircraft>(field: K, value: Aircraft[K]) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="aircraft-detail">
            <div className="page-header-row">
                <div className="page-heading-left">
                    <h1 className="page-title">
                        {isEditMode ? 'Edit Aircraft Info' : 'Aircraft Details'}
                    </h1>
                    <div className="breadcrumb">
                        <span className="breadcrumb-section">Aircraft</span>
                        <span className="breadcrumb-arrow">›</span>
                        <span className="breadcrumb-current">
                            {isEditMode ? 'Edit Detail' : 'View Detail'}
                        </span>
                    </div>
                </div>

                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
            </div>

            <h2 className="section-title">Aircraft Profile</h2>

            <AircraftProfileSection
                editData={editData}
                originalData={originalData}
                isEditMode={isEditMode}
                handleChange={handleChange}
            />


            <FlightSchedule
                flightList={flightList}
                loading={loading}
                sortOption={sortOption}
                setSortOption={setSortOption}
                flightFilter={flightFilter}
                setFlightFilter={setFlightFilter}
            />
        </div>
    );
};

export default AircraftDetail;
