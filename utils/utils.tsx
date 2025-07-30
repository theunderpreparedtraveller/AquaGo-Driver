import { supabase } from '../lib/supabase';
const handleDelivered = async (orderId: string) => {
    const { data, error } = await supabase
    .from('water_deliveries')
    .update({ status: 'completed' })
    .eq('id', orderId);
    console.log("from utils", data)
}
export { handleDelivered };