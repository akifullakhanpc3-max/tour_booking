import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5000;
const database = process.env.MONGO_URL;


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
console.log(process.env.MONGO_URL)


const AdminConnection = mongoose.createConnection(`${database}/admin`);
const UserConnection = mongoose.createConnection(`${database}/user`);
const packageConnection = mongoose.createConnection(`${database}/package`)


if (AdminConnection) {
    console.log("connect to admin")
}
if (UserConnection) {
    console.log("conntect to user");

}




const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const admin = AdminConnection.model('admin', adminSchema);

app.post('/admin', async (req, res) => {
    try {
        console.log(req.body.username);
        const { username, password } = req.body;
        console.log(username)

        const adminData = await admin.findOne({ username });

        if (!adminData) {
            return res.status(401).json({ success: false });
        }

        if (adminData.password === password) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }

    } catch (error) {
        res.status(500).json({ success: false });
        console.log(error)
    }
});
//getting admin data
app.get('/get-admin', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ success: false });
        }

        const adminData = await admin.findOne({ username });

        if (!adminData) {
            return res.status(401).json({ success: false });
        }

        return res.json({
            success: true,
            username: adminData.username
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
});
// getting admin details
app.get('/get-admin-data/:username',async(req,res)=>{
    const {username} = req.params;
    let data = username
    console.log(data)
    if(!data){
        return res.status(404);
    }
    try {
        const isAdmin=await admin.findOne({username})
        console.log(isAdmin);
        if(isAdmin){
            res.json({
                success:true,
                data:isAdmin
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"failed to get data"
        })
    }
})
//updating admin

// ================= UPDATE ADMIN =================
app.put("/update-admin/:username", async (req, res) => {
    const { username } = req.params;
    const { newUsername, password } = req.body;
  
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username param missing"
      });
    }
  
    if (!newUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "New username & password required"
      });
    }
  
    try {
      const updatedAdmin = await admin.findOneAndUpdate(
        { username: username },
        {
          username: newUsername,
          password: password
        },
        { new: true }
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found"
        });
      }
  
      res.json({
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin
      });
  
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  });

//creating package
const packageSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    rating: Number,
    days: Number
})
const packages = packageConnection.model('package', packageSchema);

app.post('/create-package', async (req, res) => {
    try {
        let isPackage = await packages.findOne({ name: req.body.name })
        console.log(isPackage);
        if (isPackage) {
            res.json({
                success: false,
                message: "Package already exist"
            })
        } else {
            const data = req.body;
            console.log(data)
            const response = packages.create(data)
            if (response) {
                res.json({
                    success: true,
                    message: "item saved"
                })
            }
            else {
                res.status(404).json({
                    success: false,
                    message: "item not saved"
                })
            }
        }
    }
    catch (error) {
        res.send(404, "error \n")
        console.log(error)
    }
})

//get package for seperate tabs details 
app.post('/get-package-details', async (req, res) => {
    const { id } = req.body;

    console.log("Received ID:", id);

    // ✅ Validate ID
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "ID is required"
        });
    }

    try {
        const data = await packages.findById(id); // ✅ better method

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        return res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
});


//getting all package
app.get('/get-package', async (req, res) => {
    const response = await packages.find()
    res.json(response);
});

//updating packages
app.put('/update-package', async (req, res) => {
    const { _id, ...data } = req.body;
    // console.log(data)
    console.log(`updating this id${_id}`)
    if (!_id) {
        return res.status(400).json({
            success: false,
            message: "ID is required"
        });
    }
    try {
        const isUpdated = await packages.findOneAndUpdate({ _id }, data, { returnDocument: true })
        // console.log(isUpdated)
        if (isUpdated) {

            res.json({
                success: true,
                message: "item updated"
            })
        } else {
            console.log("error")
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unable to update item"
        })
        console.log(error)
    }

})
//deleting packages
app.delete('/delete-package/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Deleting ID:", id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required"
            });
        }

        const deletedItem = await packages.findByIdAndDelete(id);
        console.log("Deleted Item:", deletedItem);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        res.json({
            success: true,
            message: "Package deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});