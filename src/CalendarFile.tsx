import { useState, useEffect } from 'react'; // Import useEffect
import { useParams } from 'react-router-dom';
import ical from 'ical-generator';
import { supabase } from './supabaseClient';
import axios from 'axios';
import { Reminder, UserListData } from './interfaces/interfaces';

const IosCalendar = () => {

    const { api_token, user_id, list_id } = useParams();
    const [calendarName, setCalendarName] = useState('');

    const getCalendarName = async () => {
        try {
            const { data, error } = await supabase
                .from('project_list')
                .select('list_name')
                .eq('user_id', user_id)
                .eq('service_id', list_id);

            if (error) {
                console.error('Error fetching data:', error.message);
                return null;
            }

            if (data.length === 1) {
                setCalendarName(data[0].list_name);
            } else {
                console.error('More than one row found or no rows found.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const getRemindersForCalendar = async () => {
        try {
            const { data, error } = await supabase
                .from('list_item')
                .select('*')
                .eq('user_id', user_id)
                .eq('list_service_id', list_id);

            console.log(data);
            if (error) {
                console.error('Error fetching data:', error.message);
                return [];
            }
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    const fetchRemindersFromProject = async (projectId: string, token: string) => {
        try {
            const response = await axios.get(`https://api.todoist.com/rest/v2/tasks?project_id=${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            return response.data;
        } catch {
            console.error('Error fetching reminders:');
            return null;
        }
    };

    const getUsersLists = async () => {
        const { data, error } = await supabase
            .from('project_list') // Your table name
            .select('*') // Column you want to retrieve
            .eq('user_id', user_id); // Condition to match the user ID

        if (error) {
            console.error('Error fetching service IDs:', error);
            return null;
        }

        return data;
    }

    function compareReminders(a: any, b: any) {
        // Compare by due_date first
        if (a.due.date < b.due.date) return -1;
        if (a.due.date > b.due.date) return 1;

        return b.priority - a.priority; 
    }

    async function saveReminderForDate(reminder: Reminder, startDate: Date) {
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 60); // Adding 60 minutes

        const { error: deleteError } = await supabase
            .from('list_item')
            .delete()
            .eq('service_id', reminder.id);

        if (deleteError) {
            // Handle delete error
        } else {
            // Successfully deleted record
        }

        let new_list_item = {
            user_id: user_id,
            list_service_id: reminder.project_id,
            service_id: reminder.id,
            name: reminder.content,
            start_date: startDate,
            end_date: endDate,
            description: reminder.description,
            priority: reminder.priority,
            completed_by: reminder.due.date
        };

        // Insert new record
        const { error: insertError } = await supabase
            .from('list_item')
            .insert([new_list_item]);

        if (insertError) {
            // Handle insert error
        } else {
            // Successfully inserted new record
        }
    }

    function findWindowForReminder(sortedReminders: Reminder[], userListData: UserListData[]): void {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        const scheduledSlots: Date[] = [];

        for (const reminder of sortedReminders) {
            let startHour = currentHour;
            let dayIndex = currentDay;
            let foundSlot = false;
            let daysPast = 0;

            while (!foundSlot) {
                const list = userListData.find(list => list.service_id === reminder.project_id);
                if (!list) {
                    console.error(`list data not found for project ${reminder.project_id}`);
                    return;
                }

                const availability = [
                    list.sunday_availability,
                    list.monday_availability,
                    list.tuesday_availability,
                    list.wednesday_availability,
                    list.thursday_availability,
                    list.friday_availability,
                    list.saturday_availability
                ];

                if (availability[dayIndex] && startHour >= parseInt(list.start_availability.split(":")[0]) && startHour < parseInt(list.end_availability.split(":")[0])) {
                    const overlappingSlot = scheduledSlots.find(slot => slot.getHours() === startHour && slot.getDate() === now.getDate() + daysPast);
                    if (!overlappingSlot) {
                        foundSlot = true;
                        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysPast, startHour);
                        scheduledSlots.push(startDate);
                        saveReminderForDate(reminder, startDate);
                    }
                }
                startHour++;
                if (startHour >= 24) {
                    startHour = 0;
                    daysPast++;
                    dayIndex = (dayIndex + 1) % 7;
                }
            }
        }
    }

    const runTaskOptimizationMethod = async () => {
        const { data, error } = await supabase
            .from('user_api_keys')
            .select('last_update')
            .eq('user_id', user_id)
            .single();

        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        if (data) {
            const today = new Date().toISOString().slice(0, 10); 

            if (!data.last_update || data.last_update !== today) {
                const { error: updateError } = await supabase
                    .from('user_api_keys')
                    .update({ last_update: today })
                    .eq('user_id', user_id);

                if (updateError) {
                    console.error('Error updating last_update:', updateError.message);
                    return;
                }
                const projectReminders = []

                if (list_id !== undefined && api_token !== undefined) {
                    const userListData = await getUsersLists();
                    if (!userListData) {
                        return;
                    }
                    const listsOfUser = userListData.map((row) => row.service_id);
                    if (listsOfUser) {
                        for (let index = 0; index < listsOfUser.length; index++) {
                            // const element = array[index];
                            const remindersOfList = await fetchRemindersFromProject(listsOfUser[index], api_token);
                            if (remindersOfList)
                                projectReminders.push(...remindersOfList);
                        }
                        const sortedReminders = projectReminders.sort(compareReminders);

                        findWindowForReminder(sortedReminders, userListData)
                    }
                }
            } else {
                console.log('last_update is already today. No action needed.');
            }
        } else {
            console.log('No data found for the user ID:', user_id);
        }
    }

    const generateICS = async () => {
        try {
            await runTaskOptimizationMethod();
            await getCalendarName();
            const data = await getRemindersForCalendar();

            const calendar = ical({ name: calendarName + ' Calendar' });

            data.forEach(row => {
                calendar.createEvent({
                    start: row.start_date,
                    end: row.end_date,
                    summary: row.name,
                    description: row.description,
                    location: 'Prague, Czech Republic',
                });
            });

            const calendarData = calendar.toString();
            const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            window.location.href = url;

        } catch (error) {
            console.error('Error generating ICS:', error);
        }
    };

    useEffect(() => {
        generateICS();
    }, []);

    return (
        <div>
            <h1 style={{ color: 'white' }}>Calendar Download</h1>
        </div>
    );
};

export default IosCalendar;