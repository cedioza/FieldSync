import React, { useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useStore } from '../../store/useStore';

export default function AppTour() {
    const { runTour, setRunTour, viewRole } = useStore();

    // Initial check (only run once unless re-triggered)
    useEffect(() => {
        const hasSeenTour = localStorage.getItem(`fieldsync_tour_seen_${viewRole}`);
        if (!hasSeenTour) {
            // Short delay to ensure DOM is fully painted
            const timer = setTimeout(() => setRunTour(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [viewRole, setRunTour]);

    const getSteps = (): Step[] => {
        if (viewRole === 'dispatcher') {
            return [
                {
                    content: (
                        <div>
                            <h3 className="text-white font-bold mb-2 tracking-wide font-mono text-sm uppercase">Welcome to FieldSync Dispatch ⚡</h3>
                            <p className="text-[#cbd5e1] text-xs leading-relaxed">This is the Command Center where you manage field operations, assign tickets, and track technicians in real-time.</p>
                        </div>
                    ),
                    placement: 'center',
                    target: 'body',
                },
                {
                    target: '.tour-order-queue',
                    content: (
                        <div>
                            <h3 className="text-[#2d7aff] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Global Order Queue</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">All incoming tickets land here. Filter them by region, repair type, or severity to prioritize your dispatch flow.</p>
                        </div>
                    ),
                    placement: 'right',
                },
                {
                    target: '.tour-add-button',
                    content: (
                        <div>
                            <h3 className="text-[#ff2d2d] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Create Tickets</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Need to log a new issue manually? Click here to fill out a dispatch form and push it immediately to the queue.</p>
                        </div>
                    ),
                    placement: 'right',
                },
                {
                    target: '.tour-live-map',
                    content: (
                        <div>
                            <h3 className="text-[#00e5a0] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Live Operations Map</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Track your fleet geographically. Green pulsing dots indicate active field techs. Red markers are critical unassigned faults.</p>
                        </div>
                    ),
                    placement: 'bottom',
                },
                {
                    target: '.tour-stats-header',
                    content: (
                        <div>
                            <h3 className="text-[#ffd93d] font-bold mb-1 font-mono text-xs uppercase tracking-widest">National Key Metrics</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Keep an eye on monthly ticket volume, real-time active field orders, and total connected contractors.</p>
                        </div>
                    ),
                    placement: 'bottom',
                },
                {
                    target: '.tour-detail-panel',
                    content: (
                        <div>
                            <h3 className="text-white font-bold mb-1 font-mono text-xs uppercase tracking-widest">Ticket Inspector</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Select any ticket from the queue or map, and its full scope, history, and dispatch controls will appear here.</p>
                        </div>
                    ),
                    placement: 'left',
                },
                {
                    target: '.tour-role-tabs',
                    content: (
                        <div>
                            <h3 className="text-white font-bold mb-1 font-mono text-xs uppercase tracking-widest">Role Simulator</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">For this demo, switch your view here to see exactly what the Field Technicians or Contractors see on their apps.</p>
                        </div>
                    ),
                    placement: 'bottom',
                }
            ];
        }

        if (viewRole === 'contractor') {
            return [
                {
                    content: (
                        <div>
                            <h3 className="text-white font-bold mb-2 tracking-wide font-mono text-sm uppercase">Contractor Portal 🏢</h3>
                            <p className="text-[#cbd5e1] text-xs leading-relaxed">Manage your company's workload, track billable hours, and oversee your entire fleet of technicians.</p>
                        </div>
                    ),
                    placement: 'center',
                    target: 'body',
                },
                {
                    target: '.tour-contractor-performance',
                    content: (
                        <div>
                            <h3 className="text-[#ffd93d] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Performance KPIs</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Monitor your completion rate, total billable hours, and open tickets at a glance.</p>
                        </div>
                    ),
                    placement: 'bottom',
                },
                {
                    target: '.tour-contractor-fleet',
                    content: (
                        <div>
                            <h3 className="text-[#00e5a0] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Fleet Status</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">See which of your technicians are currently busy in the field, available, or logged off.</p>
                        </div>
                    ),
                    placement: 'right',
                },
                {
                    target: '.tour-contractor-orders',
                    content: (
                        <div>
                            <h3 className="text-[#2d7aff] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Active Orders</h3>
                            <p className="text-[#94a3b8] text-xs leading-relaxed">Review all tickets assigned to your company. Assign operators to immediately push it to their mobile devices.</p>
                        </div>
                    ),
                    placement: 'top',
                }
            ];
        }

        // Tech View
        return [
            {
                content: (
                    <div>
                        <h3 className="text-white font-bold mb-2 tracking-wide font-mono text-sm uppercase">Field Tech App 👨‍🔧</h3>
                        <p className="text-[#cbd5e1] text-xs leading-relaxed">This is the mobile-first view for field technicians. It provides everything needed to clear a ticket on-site.</p>
                    </div>
                ),
                placement: 'center',
                target: 'body',
            },
            {
                target: '.tour-tech-status',
                content: (
                    <div>
                        <h3 className="text-[#00e5a0] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Connection Status</h3>
                        <p className="text-[#94a3b8] text-xs leading-relaxed">Ensure you have signal and battery. Push notifications will alert you when a new assignment drops.</p>
                    </div>
                ),
                placement: 'bottom',
            },
            {
                target: '.tour-tech-ticket',
                content: (
                    <div>
                        <h3 className="text-[#2d7aff] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Assigned Ticket</h3>
                        <p className="text-[#94a3b8] text-xs leading-relaxed">Review the location, requirements, and full background of your current job before arriving on site.</p>
                    </div>
                ),
                placement: 'bottom',
            },
            {
                target: '.tour-tech-checklist',
                content: (
                    <div>
                        <h3 className="text-[#ff2d2d] font-bold mb-1 font-mono text-xs uppercase tracking-widest">Mandatory Photos</h3>
                        <p className="text-[#94a3b8] text-xs leading-relaxed">Capture required photographic proof. The app automatically tags GPS and exact timestamp data to prevent fraud.</p>
                    </div>
                ),
                placement: 'top',
            }
        ];
    };

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            localStorage.setItem(`fieldsync_tour_seen_${viewRole}`, 'true');
        }
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={runTour} // Driven by Global Status
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={getSteps()} // Dynamic based on ViewRole
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#2d7aff',
                    backgroundColor: '#0d1117',
                    arrowColor: '#0d1117',
                    textColor: '#ffffff',
                    overlayColor: 'rgba(6, 8, 16, 0.85)',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                tooltip: {
                    border: '1px solid #1a2030',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    padding: '24px',
                },
                buttonNext: {
                    backgroundColor: '#2d7aff',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    padding: '8px 16px',
                },
                buttonBack: {
                    marginRight: 10,
                    color: '#64748b',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                },
                buttonSkip: {
                    color: '#64748b',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }
            }}
        />
    );
}
