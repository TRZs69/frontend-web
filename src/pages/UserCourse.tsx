import React, { useEffect, useState } from 'react';
//@ts-ignore
import { UserDto } from '../dto/UserDto';
import api from '../api/api';
import { useParams, Link } from 'react-router-dom';
import DataTable from 'datatables.net-react';
import { UsercourseDto } from '../dto/UsercourseDto';
import { CourseDto } from '../dto/CourseDto';
import Swal from 'sweetalert2';
import axios from 'axios';
import SectionLoader from '../components/SectionLoader';

const UserCourse: React.FC = () => {
  const { id } = useParams();
  const [dataCourse, setDataCourse] = useState<CourseDto>();
  const [data, setData] = useState<UserDto[]>([]);
  const [studentCourse, setStudentCourse] = useState<UserDto[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);
  const [isSectionLoading, setIsSectionLoading] = useState<boolean>(true);

  const blurActiveElement = () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  };

  const fetchCourse = async () => {
    const courseResponse = await api.get<CourseDto>(`/course/${id}`);

    if (courseResponse.data?.id) {
      setDataCourse(courseResponse.data);
    }
  }

  const fetchStudent = async () => {
    try {
      const userResponse = await api.get<UserDto[]>('/user?role=STUDENT');
      setData(userResponse.data);
    } catch (err) {
      console.log(err)
    }
  }

  const fetchData = async () => {
    try {
      const studentCourseResponse = await api.get<UserDto[]>(`/course/${id}/users`);
      setStudentCourse(studentCourseResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsSectionLoading(true);
      await Promise.all([fetchStudent(), fetchCourse(), fetchData()]);
      setIsSectionLoading(false);
    };

    loadInitialData();
  }, []);

  const handleClearForm = () => {
    setUserId(0);

    setIsAddModalOpen(false);
  }

  const handleAddUserCourse = async () => {
    if (userId <= 0) {
      blurActiveElement();
      await Swal.fire('Validation', 'Please select a student first.', 'warning');
      return;
    }

    const uploadData: UsercourseDto = {
      userId: userId,
      courseId: Number(id),
    }

    try {
      const response = await api.post<UsercourseDto>('/usercourse', uploadData)
      console.log(response.data);

      handleClearForm();
      fetchData();
      blurActiveElement();
      Swal.fire('Success!', 'Student has been added to the course.', 'success');
    } catch (error) {
      console.error('Error while adding user course :', error);

      let errorMessage = 'Failed to add student to the course.';
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        if (statusCode === 409) {
          errorMessage = 'Student is already enrolled in this course.';
        } else if (statusCode === 400) {
          errorMessage = String(error.response?.data?.data || 'Invalid user/course data.');
        }
      }

      blurActiveElement();
      Swal.fire('Error!', errorMessage, 'error');
    }
  }

  const handleDeleteUserCourse = async (userId: number) => {
    blurActiveElement();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await api.get(`/usercourse/${userId}/${id}`);
      const userCourses = response.data;

      if (userCourses && userCourses.length > 0) {
        const userCourseId = userCourses[0].id;
        await api.delete(`/usercourse/${userCourseId}`);
        fetchData();
        blurActiveElement();
        Swal.fire('Deleted!', 'User has been removed from the course.', 'success');
      } else {
        console.error('User course mapping not found');
        blurActiveElement();
        Swal.fire('Error', 'User course mapping not found', 'error');
      }
    } catch (error) {
      console.error('Error while deleting user course:', error);
      blurActiveElement();
      Swal.fire('Error!', 'Failed to delete user course.', 'error');
    }
  };

  const enrolledStudentIds = new Set(studentCourse.map((student) => student.id));
  const availableStudents = data.filter((student) => !enrolledStudentIds.has(student.id));

  const columns = [
    { data: 'name', title: 'Name' },
    { data: 'username', title: 'Username' },
    {
      data: 'studentId',
      title: 'Students ID',
      render: function (data: string | null) {
        return data ? data : '-';
      },
    },
    {
      data: null,
      title: 'Actions',
      orderable: false,
      searchable: false,
      createdCell: (cell: HTMLTableCellElement, _: any, rowData: UserDto) => {
        cell.innerHTML = '';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex space-x-2';

        const createButton = (
          buttonColor: string,
          svgPath: string,
          title: string,
          onClick: () => void,
        ) => {
          const button = document.createElement('button');
          button.className = `px-4.5 py-2.5 ${buttonColor} text-white rounded-md`;
          button.title = title;

          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
          );
          svg.setAttribute('viewBox', '0 0 512 512');
          svg.setAttribute('width', '20');
          svg.setAttribute('height', '20');
          svg.setAttribute('fill', 'white');
          svg.innerHTML = svgPath;

          button.appendChild(svg);
          button.onclick = onClick;
          return button;
        };

        const deleteButton = createButton(
          'bg-danger',
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>`, // Example SVG for view
          'Delete',
          () => { handleDeleteUserCourse(rowData.id); },
        );

        buttonContainer.appendChild(deleteButton);

        cell.appendChild(buttonContainer);
      },
    },
  ];

  if (isSectionLoading) {
    return <SectionLoader message="Loading students..." />;
  }

  return (
    <div>
      <div className='pb-6 text-xl font-semibold'>
        <Link to="/course" className='text-blue-500 hover:text-blue-400'>Course</Link>
        {' '}&gt; Students in {dataCourse?.name}
      </div>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h1 className="text-2xl font-bold pb-5">Student Course</h1>
        <hr />
        <div className="text-end mt-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-primary text-center font-medium text-white hover:bg-opacity-90"
          >
            Add Student
          </button>
        </div>
        <div className="max-w-full overflow-x-auto ">
          <DataTable
            data={studentCourse}
            columns={columns}
            className="display nowrap w-full"
          />
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-9999">
          <div
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
            style={{ width: '800px', maxWidth: '90%' }}
          >
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Add User
              </h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-black dark:text-white"
                  >
                    Name
                  </label>
                  <select
                    name="name"
                    id="name"
                    value={userId}
                    className="relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent py-3 px-5 pr-10 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                    onChange={(e) => setUserId(Number(e.target.value))}
                  >
                    <option value={0}>Select a user</option>
                    {availableStudents.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {availableStudents.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">All students are already enrolled in this course.</p>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => handleClearForm()}
                    className="bg-gray-400 hover:bg-opacity-90 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleAddUserCourse().then();
                    }}
                    className="bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCourse;
