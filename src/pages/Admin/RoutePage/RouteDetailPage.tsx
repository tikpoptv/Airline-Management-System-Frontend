// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { getRouteById } from '../../../services/route/routeService';
// import { Route } from '../../../types/route';
// import GlobeMap, {
//   Airport as MapAirport
// } from './components/GlobeMap/GlobeMap';
// import './RouteDetailPage.css';

// /* ---------- Local types ---------- */
// interface ErrorState {
//   message: string;
//   code?: number;
// }

// const RouteDetailPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [route, setRoute] = useState<Route | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<ErrorState | null>(null);

//   /* ---------- fetch data ---------- */
//   useEffect(() => {
//     // IIFE with void to ensure `useEffect` callback returns `void`
//     void (async () => {
//       if (!id) {
//         setError({ message: 'ไม่พบรหัสเส้นทางการบิน', code: 400 });
//         setLoading(false);
//         return;
//       }

//       try {
//         const routeId = parseInt(id, 10);
//         if (Number.isNaN(routeId)) {
//           throw new Error('รหัสเส้นทางการบินไม่ถูกต้อง');
//         }

//         const routeData = await getRouteById(routeId);

//         if (routeData) {
//           setRoute(routeData);
//         } else {
//           setError({ message: 'ไม่พบข้อมูลเส้นทางการบิน', code: 404 });
//         }
//       } catch (err) {
//         setError({
//           message:
//             err instanceof Error
//               ? err.message
//               : 'ไม่สามารถโหลดข้อมูลเส้นทางการบินได้',
//           code: 500
//         });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id]);

//   /* ---------- helpers ---------- */
//   const handleBack = (): void => {
//     navigate('/admin/pathways/routes') as void;
//   };

//   const formatDuration = (duration: string): string => {
//     const [h, m] = duration.split(':');
//     return `${parseInt(h, 10)} ชั่วโมง ${parseInt(m, 10)} นาที`;
//   };

//   const formatDistance = (d: number): string =>
//     new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(d);

//   /* ---------- render states ---------- */
//   if (loading) {
//     return (
//       <div className="route-detail-loading">
//         <div className="route-detail-loading__spinner" />
//         <div className="route-detail-loading__text">
//           กำลังโหลดข้อมูลเส้นทางการบิน...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="route-detail-error">
//         <div className="route-detail-error__icon">⚠️</div>
//         <div className="route-detail-error__message">{error.message}</div>
//         <button className="route-detail-error__button" onClick={handleBack}>
//           กลับไปหน้าเส้นทางการบิน
//         </button>
//       </div>
//     );
//   }

//   if (!route) {
//     return (
//       <div className="route-detail-error">
//         <div className="route-detail-error__icon">🔍</div>
//         <div className="route-detail-error__message">
//           ไม่พบข้อมูลเส้นทางการบิน
//         </div>
//         <button className="route-detail-error__button" onClick={handleBack}>
//           กลับไปหน้าเส้นทางการบิน
//         </button>
//       </div>
//     );
//   }

//   /* ---------- adapt data for GlobeMap ---------- */
//   const fromAirportMapped: MapAirport = {
//     iata_code: route.from_airport.iata_code,
//     name: route.from_airport.name,
//     lat: route.from_airport.latitude,
//     lon: route.from_airport.longitude
//   };
//   const toAirportMapped: MapAirport = {
//     iata_code: route.to_airport.iata_code,
//     name: route.to_airport.name,
//     lat: route.to_airport.latitude,
//     lon: route.to_airport.longitude
//   };

//   /* ---------- main render ---------- */
//   return (
//     <div className="route-detail">
//       {/* ===== Header ===== */}
//       <div className="route-detail__header">
//         <div className="route-detail__breadcrumb">
//           <button className="route-detail__back-btn" onClick={handleBack}>
//             ←
//           </button>
//           <span>เส้นทางการบิน</span>
//           <span className="route-detail__breadcrumb-separator">/</span>
//           <span>รายละเอียด</span>
//         </div>

//         <div className="route-detail__title">
//           <h1>เส้นทางการบิน #{route.route_id}</h1>
//           <div
//             className={`route-detail__status route-detail__status--${route.status.toLowerCase()}`}
//           >
//             {route.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
//           </div>
//         </div>
//       </div>

//       {/* ===== Body ===== */}
//       <div className="route-detail__container">
//         {/* --- Map --- */}
//         <div className="route-detail__map">
//           <GlobeMap
//             fromAirport={fromAirportMapped}
//             toAirport={toAirportMapped}
//           />
//         </div>

//         {/* --- Info panel --- */}
//         <div className="route-detail__info-container">
//           <div className="route-detail__airports">
//             {/* From */}
//             <div className="route-detail__airport route-detail__airport--from">
//               <div className="route-detail__airport-code">
//                 {route.from_airport.iata_code}
//               </div>
//               <div className="route-detail__airport-details">
//                 <div className="route-detail__airport-name">
//                   {route.from_airport.name}
//                 </div>
//                 <div className="route-detail__airport-location">
//                   <span>{route.from_airport.city}</span>
//                   <span className="route-detail__airport-separator">•</span>
//                   <span>{route.from_airport.country}</span>
//                 </div>
//                 <div className="route-detail__airport-timezone">
//                   เขตเวลา: {route.from_airport.timezone}
//                 </div>
//                 <div className="route-detail__airport-coordinates">
//                   พิกัด: {route.from_airport.latitude.toFixed(4)}, {route.from_airport.longitude.toFixed(4)}
//                 </div>
//               </div>
//             </div>

//             {/* Flight info (floating) */}
//             <div className="route-detail__flight-info route-detail__flight-info--floating">
//               <div className="route-detail__flight-icon">✈️</div>
//               <div className="route-detail__duration">
//                 <div className="route-detail__info-label">ระยะเวลาบิน</div>
//                 <div className="route-detail__info-value">
//                   {formatDuration(route.estimated_duration)}
//                 </div>
//               </div>
//               <div className="route-detail__distance">
//                 <div className="route-detail__info-label">ระยะทาง</div>
//                 <div className="route-detail__info-value">
//                   {formatDistance(route.distance)} กิโลเมตร
//                 </div>
//               </div>
//             </div>

//             {/* To */}
//             <div className="route-detail__airport route-detail__airport--to">
//               <div className="route-detail__airport-code">
//                 {route.to_airport.iata_code}
//               </div>
//               <div className="route-detail__airport-details">
//                 <div className="route-detail__airport-name">
//                   {route.to_airport.name}
//                 </div>
//                 <div className="route-detail__airport-location">
//                   <span>{route.to_airport.city}</span>
//                   <span className="route-detail__airport-separator">•</span>
//                   <span>{route.to_airport.country}</span>
//                 </div>
//                 <div className="route-detail__airport-timezone">
//                   เขตเวลา: {route.to_airport.timezone}
//                 </div>
//                 <div className="route-detail__airport-coordinates">
//                   พิกัด: {route.to_airport.latitude.toFixed(4)}, {route.to_airport.longitude.toFixed(4)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RouteDetailPage;
