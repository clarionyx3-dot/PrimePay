// Inventory minus karne ka logic
const consumeInventory = async (orderItems) => {
    try {
        for (const item of orderItems) {
            // Hum check karenge ke is dish ki recipe mein kya kya hai
            // (Farz karein aapne menu item mein 'recipe' field rakhi hai)
            const menuItem = await Menu.findById(item.id);
            
            if (menuItem && menuItem.ingredients) {
                for (const ingredient of menuItem.ingredients) {
                    const qtyToReduce = ingredient.amount * item.qty;
                    
                    // Inventory collection mein item ko update karo
                    await Inventory.findOneAndUpdate(
                        { name: ingredient.name },
                        { $inc: { quantity: -qtyToReduce } }
                    );
                }
            }
        }
        console.log("Inventory synced with order! ✅");
    } catch (e) {
        console.error("Inventory sync failed:", e.message);
    }
};