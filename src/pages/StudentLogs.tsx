import { useEffect, useState } from 'react';
import api from '../api/api';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import SectionLoader from '../components/SectionLoader';

DataTable.use(DT);

interface StudentSummary {
  userId: number;
  name: string;
  studentId: string;
  sessions: {
    total: number;
    activeDays: number;
    returnRatePct: number;
    avgDurationSec: number | null;
  };
  assessments: {
    totalSubmitted: number;
    avgGrade: number | null;
    totalPointsEarned: number;
  };
  badges: {
    totalEarned: number;
  };
  chapters: {
    totalCompleted: number;
  };
  chat: {
    totalSessions: number;
    totalMessages: number;
    userMessages: number;
  };
  questionnaire: {
    averages: {
      q1Autonomy: number;
      q2Competence1: number;
      q3Competence2: number;
      q4Relatedness: number;
      q5Behavioral: number;
      q6Cognitive: number;
      q7Emotional: number;
      q8Overall: number;
    } | null;
  };
}

export default function StudentLogs() {
  const [data, setData] = useState<StudentSummary[]>([]);
  const [isSectionLoading, setIsSectionLoading] = useState<boolean>(true);
  const [tableKey, setTableKey] = useState<number>(0);

  const fetchData = async () => {
    try {
      const response = await api.get<{ students: StudentSummary[] }>('/evaluation/summary/all', { skipCache: true });
      setData(response.data.students);
    } catch (error) {
      console.error('Error fetching student logs: ', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsSectionLoading(true);
      await fetchData();
      setTableKey((prev) => prev + 1);
      setIsSectionLoading(false);
    };

    loadInitialData();
  }, []);

  const columns = [
    { data: 'name', title: 'Name' },
    { data: 'studentId', title: 'Student ID' },
    { data: 'sessions.activeDays', title: 'Active Days' },
    { data: 'sessions.total', title: 'Sessions' },
    { 
      data: 'sessions.avgDurationSec', 
      title: 'Avg Dur (m)',
      render: (data: number | null) => data ? Math.round(data / 60) : 0
    },
    { data: 'sessions.returnRatePct', title: 'Return Rate (%)' },
    { data: 'assessments.totalSubmitted', title: 'Assessments' },
    { 
      data: 'assessments.avgGrade', 
      title: 'Avg Grade',
      render: (data: number | null) => data ?? '-'
    },
    { data: 'chapters.totalCompleted', title: 'Chapters' },
    { data: 'chat.userMessages', title: 'Chat Msgs' },
    {
        data: 'questionnaire.averages.q8Overall',
        title: 'Survey Overall',
        render: (data: number | null) => data ?? '-'
    }
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        {isSectionLoading ? (
          <SectionLoader />
        ) : (
          <DataTable
            key={tableKey}
            data={data}
            columns={columns}
            options={{
              pageLength: 10,
              order: [[0, 'asc']],
            }}
            className="display"
          />
        )}
      </div>
    </div>
  );
}
